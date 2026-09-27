import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-service';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orgId = url.searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ success: false, error: 'orgId is required' }, { status: 400 });
    }

    const approvals = await sql`
      SELECT 
        a.*,
        e.title as expense_title,
        e.total_amount as expense_amount,
        e.category as expense_category,
        e.receipt_url as expense_receipt_url,
        e.cost_center as expense_cost_center,
        u.name as requester_name,
        u.email as requester_email
      FROM approvals a
      LEFT JOIN expenses e ON a.expense_id = e.id
      LEFT JOIN users u ON a.requester_id = u.id
      WHERE a.organization_id = ${orgId}
      ORDER BY a.created_at DESC;
    `;

    return NextResponse.json({ success: true, approvals });
  } catch (error: any) {
    console.error('Approvals GET route error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;
    const sessionUser = await getCurrentUser();
    const currentUserId = sessionUser?.id || body.userId || 'usr-anon';

    // 1. Evaluate Expense Against Org Policies
    if (action === 'evaluate-expense') {
      const { expenseId, orgId, amount, category, hasReceipt, costCenter } = body;
      if (!expenseId || !orgId) {
        return NextResponse.json({ success: false, error: 'expenseId and orgId are required' }, { status: 400 });
      }

      // Fetch org policy for this category
      const policies = await sql`
        SELECT * FROM expense_policies
        WHERE organization_id = ${orgId} AND LOWER(category) = LOWER(${category})
        LIMIT 1;
      `;

      let needsApproval = false;
      let violationReason = '';

      if (policies.length > 0) {
        const policy = policies[0];
        const numAmount = Number(amount);
        const dailyCap = Number(policy.daily_cap);
        const autoThreshold = Number(policy.auto_approval_threshold);

        if (numAmount > dailyCap) {
          needsApproval = true;
          violationReason = `Exceeds maximum ${policy.category} daily allowance cap of ₹${dailyCap.toLocaleString('en-IN')}.`;
        } else if (numAmount > autoThreshold) {
          needsApproval = true;
          violationReason = `Exceeds single-transaction auto-approval threshold of ₹${autoThreshold.toLocaleString('en-IN')}. Requires manager signoff.`;
        } else if (policy.requires_receipt && !hasReceipt) {
          needsApproval = true;
          violationReason = `Corporate compliance policy mandates a verified bill receipt image for ${policy.category} spend.`;
        }
      }

      if (needsApproval) {
        const approvalId = 'appr-' + Date.now();
        await sql`
          INSERT INTO approvals (
            id, expense_id, organization_id, requester_id, status, violation_reason
          ) VALUES (
            ${approvalId}, ${expenseId}, ${orgId}, ${currentUserId}, 'pending', ${violationReason}
          );
        `;

        await sql`
          UPDATE expenses
          SET approval_status = 'pending',
              cost_center = ${costCenter || 'Engineering'}
          WHERE id = ${expenseId};
        `;

        return NextResponse.json({
          success: true,
          status: 'pending',
          violationReason,
          approvalId,
          message: 'Flagged for corporate manager approval',
        });
      } else {
        await sql`
          UPDATE expenses
          SET approval_status = 'approved',
              cost_center = ${costCenter || 'Engineering'}
          WHERE id = ${expenseId};
        `;

        return NextResponse.json({
          success: true,
          status: 'approved',
          message: 'Auto-approved under company policy threshold',
        });
      }
    }

    // 2. Decide on Approval (Approve / Reject) with FC.2 Multi-Level Chains
    if (action === 'decide') {
      const { approvalId, decision, comments = '', userRole = 'manager' } = body;
      if (!approvalId || !decision) {
        return NextResponse.json({ success: false, error: 'approvalId and decision required' }, { status: 400 });
      }

      // Check current approval status and expense amount
      let currentItem: any = null;
      try {
        const rows = await sql`
          SELECT a.*, e.total_amount as expense_amount 
          FROM approvals a 
          LEFT JOIN expenses e ON a.expense_id = e.id 
          WHERE a.id = ${approvalId} LIMIT 1;
        `;
        currentItem = rows[0];
      } catch (e) {}

      let targetStatus = decision;
      const expenseAmount = Number(currentItem?.expense_amount || 0);
      const isHighValue = expenseAmount >= 20000;

      // FC.2: If approving tier 1 of a high-value expense, route to Tier-2
      if (decision === 'approved' && currentItem?.status === 'pending' && isHighValue) {
        targetStatus = 'pending_tier2';
      }

      try {
        const updatedApproval = await sql`
          UPDATE approvals
          SET status = ${targetStatus},
              approver_id = ${currentUserId},
              comments = ${comments || (targetStatus === 'pending_tier2' ? 'Tier-1 Manager approved. Routed to Tier-2 Director for high-value clearance.' : '')},
              decided_at = CURRENT_TIMESTAMP
          WHERE id = ${approvalId}
          RETURNING *;
        `;

        if (updatedApproval.length > 0) {
          const expenseId = updatedApproval[0].expense_id;
          await sql`
            UPDATE expenses
            SET approval_status = ${targetStatus}
            WHERE id = ${expenseId};
          `;
        }
      } catch (dbErr) {
        console.warn('DB update fallback for approvals:', dbErr);
      }

      return NextResponse.json({
        success: true,
        decision: targetStatus,
        message:
          targetStatus === 'pending_tier2'
            ? 'Tier-1 Approved. Routed to Tier-2 Finance Director for high-value clearance.'
            : `Expense has been ${targetStatus}`,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Approvals POST route error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
