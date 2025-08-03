import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { supabaseUrl, supabaseServiceKey } = await req.json();
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase URL or service key' }, { status: 400 });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Table row counts
    const { count: appCount } = await supabase.from('apps').select('*', { count: 'exact', head: true });
    // Add more tables as needed
    // const { count: anotherCount } = await supabase.from('another_table').select('*', { count: 'exact', head: true });

    // DB health: try a simple query
    let dbHealthy = false;
    try {
      const { error } = await supabase.rpc('version'); // or any simple query
      dbHealthy = !error;
    } catch {
      dbHealthy = false;
    }

    // DB requests: Not available via public API, so return null
    const dbRequests = null;
    // Storage usage: Not available via public API, so return null
    const storageUsage = null;

    // Get all table names from information_schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    let tableStats = [];
    if (!tablesError && tables) {
      for (const table of tables) {
        const { count } = await supabase.from(table.table_name).select('*', { count: 'exact', head: true });
        tableStats.push({ table: table.table_name, rowCount: count });
      }
    }

    return NextResponse.json({
      tableStats,
      dbHealthy,
      dbRequests,
      storageUsage,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}