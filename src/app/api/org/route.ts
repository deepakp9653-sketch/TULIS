import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-service';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orgId = url.searchParams.get('orgId');
    const userEmail = url.searchParams.get('email');
    const sessionUser = await getCurrentUser();

    const email = userEmail || sessionUser?.email;

    // 1. If explicit orgId requested
    if (orgId) {
      const orgs = await sql`SELECT * FROM organizations WHERE id = ${orgId} LIMIT 1;`;
      if (orgs.length === 0) {
        return NextResponse.json({ success: false, error: 'Organization not found' }, { status: 404 });
      }

      const org = orgs[0];
      const members = await sql`SELECT * FROM organization_members WHERE organization_id = ${orgId} ORDER BY joined_at ASC;`;
      const policies = await sql`SELECT * FROM expense_policies WHERE organization_id = ${orgId};`;

      return NextResponse.json({
        success: true,
        organization: org,
        members,
        policies,
      });
    }

    // 2. Lookup by user's email domain
    if (email && email.includes('@')) {
      const domain = email.split('@')[1].toLowerCase();
      // Ignore common public webmail domains for corporate discovery
      const publicWebmails = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
      
      const memberRecord = await sql`
        SELECT om.*, o.name as org_name, o.domain as org_domain
        FROM organization_members om
        JOIN organizations o ON om.organization_id = o.id
        WHERE om.email = ${email}
        LIMIT 1;
      `;

      if (memberRecord.length > 0) {
        const orgIdFound = memberRecord[0].organization_id;
        const members = await sql`SELECT * FROM organization_members WHERE organization_id = ${orgIdFound};`;
        const policies = await sql`SELECT * FROM expense_policies WHERE organization_id = ${orgIdFound};`;

        return NextResponse.json({
          success: true,
          organization: {
            id: orgIdFound,
            name: memberRecord[0].org_name,
            domain: memberRecord[0].org_domain,
            userRole: memberRecord[0].role,
            userCostCenter: memberRecord[0].cost_center,
          },
          members,
          policies,
        });
      }

      // If not yet a member, check if an org exists with this domain
      if (!publicWebmails.includes(domain)) {
        const matchingOrg = await sql`
          SELECT * FROM organizations WHERE LOWER(domain) = ${domain} LIMIT 1;
        `;
        if (matchingOrg.length > 0) {
          return NextResponse.json({
            success: true,
            hasMatchingOrgDomain: true,
            organization: matchingOrg[0],
            message: `Found corporate workspace for ${domain}`,
          });
        }
      }
    }

    return NextResponse.json({ success: true, organization: null, members: [], policies: [] });
  } catch (error: any) {
    console.error('Org GET route error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;
    const sessionUser = await getCurrentUser();
    const userId = sessionUser?.id || body.userId || 'usr-' + Date.now();
    const userEmail = sessionUser?.email || body.email || 'user@company.com';

    // 1. Create Organization Workspace
    if (action === 'create-org') {
      const { name, domain, costCenters = ['Engineering', 'Sales', 'Product', 'Leadership'] } = body;
      if (!name || !domain) {
        return NextResponse.json({ success: false, error: 'Org name and domain are required' }, { status: 400 });
      }

      const orgId = 'org-' + Date.now();
      const cleanDomain = domain.toLowerCase().replace(/^@/, '');
      const existing = await sql`
        SELECT * FROM organizations
        WHERE domain = ${cleanDomain} OR email_domain = ${cleanDomain}
        LIMIT 1;
      `;

      let orgIdToUse = orgId;
      if (existing.length > 0) {
        orgIdToUse = existing[0].id;
        await sql`
          UPDATE organizations
          SET name = ${name}, domain = ${cleanDomain}, email_domain = ${cleanDomain}
          WHERE id = ${orgIdToUse};
        `;
      } else {
        await sql`
          INSERT INTO organizations (id, name, domain, email_domain, created_by)
          VALUES (${orgId}, ${name}, ${cleanDomain}, ${cleanDomain}, ${userId});
        `;
      }

      // Add creator as Admin
      const memberId = 'mem-' + Date.now();
      await sql`
        INSERT INTO organization_members (id, organization_id, user_id, email, role, cost_center)
        VALUES (${memberId}, ${orgIdToUse}, ${userId}, ${userEmail}, 'admin', 'Leadership')
        ON CONFLICT DO NOTHING;
      `;

      // Seed Default Expense Policies if new
      if (existing.length === 0) {
        const defaultPolicies = [
          { category: 'Food & Dining', daily_cap: 3500, requires_receipt: true, auto_approval_threshold: 1500 },
          { category: 'Accommodation', daily_cap: 8000, requires_receipt: true, auto_approval_threshold: 5000 },
          { category: 'Transportation', daily_cap: 2500, requires_receipt: true, auto_approval_threshold: 1000 },
          { category: 'General', daily_cap: 2000, requires_receipt: true, auto_approval_threshold: 500 },
        ];

        for (const p of defaultPolicies) {
          const policyId = 'pol-' + Math.random().toString(36).substring(2, 9);
          await sql`
            INSERT INTO expense_policies (
              id, organization_id, category, max_amount, requires_approval_above, daily_cap, requires_receipt, auto_approval_threshold
            ) VALUES (
              ${policyId}, ${orgIdToUse}, ${p.category}, ${p.daily_cap}, ${p.auto_approval_threshold}, ${p.daily_cap}, ${p.requires_receipt}, ${p.auto_approval_threshold}
            );
          `;
        }
      }

      return NextResponse.json({
        success: true,
        orgId: orgIdToUse,
        message: 'Organization workspace ready with compliance policies',
      });
    }

    // 2. Join Organization Workspace
    if (action === 'join-org') {
      const { orgId, costCenter = 'Engineering' } = body;
      if (!orgId) {
        return NextResponse.json({ success: false, error: 'Org ID required' }, { status: 400 });
      }

      const memberId = 'mem-' + Date.now();
      await sql`
        INSERT INTO organization_members (id, organization_id, user_id, email, role, cost_center)
        VALUES (${memberId}, ${orgId}, ${userId}, ${userEmail}, 'employee', ${costCenter})
        ON CONFLICT DO NOTHING;
      `;

      return NextResponse.json({ success: true, message: 'Joined corporate workspace' });
    }

    // 3. Link Trip to Corporate Org
    if (action === 'link-trip') {
      const { tripId, orgId } = body;
      if (!tripId || !orgId) {
        return NextResponse.json({ success: false, error: 'tripId and orgId required' }, { status: 400 });
      }

      await sql`
        UPDATE trips
        SET organization_id = ${orgId}
        WHERE id = ${tripId};
      `;

      return NextResponse.json({ success: true, message: 'Trip linked to corporate workspace' });
    }

    // 4. Update Policy
    if (action === 'update-policy') {
      const { policyId, dailyCap, requiresReceipt, autoApprovalThreshold } = body;
      await sql`
        UPDATE expense_policies
        SET daily_cap = ${dailyCap},
            requires_receipt = ${requiresReceipt},
            auto_approval_threshold = ${autoApprovalThreshold}
        WHERE id = ${policyId};
      `;
      return NextResponse.json({ success: true, message: 'Policy updated' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Org POST route error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
