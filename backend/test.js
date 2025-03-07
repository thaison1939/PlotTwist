const { createClient } = require("@supabase/supabase-js");
require('dotenv').config({ path: './.env' });

console.log("Loading environment variables...");
console.log("Project URL:", process.env.supabaseUrl);
console.log("API Key (partial):", process.env.supabaseKey ? process.env.supabaseKey.slice(0, 5) + "..." : "undefined");

if (!process.env.supabaseUrl || !process.env.supabaseKey) {
    console.error("Missing environment variables. Check your .env file.");
    process.exit(1);
}

const supabase = createClient(process.env.supabaseUrl, process.env.supabaseKey);

async function testQuery() {
    try {
        console.log("Starting query tests...");

        const { data: rawData, error: rawError } = await supabase.from('Celebs').select('*');
        console.log("Raw Celebs data:", rawData);
        console.log("Raw error:", rawError);

        const { count, error: countError } = await supabase
            .from('Celebs')
            .select("*", { count: "exact", head: true });
        console.log("Total count for Celebs:", count);
        console.log("Count error:", countError);

        // Test Statements table
        const { data: stmtData, error: stmtError } = await supabase.from("Statements").select("*");
        console.log("Statements data:", stmtData);
        console.log("Statements error:", stmtError);

        // Test explicit public schema
        const { data: publicData, error: publicError } = await supabase.from("public.Celebs").select("*");
        console.log("Public schema Celebs data:", publicData);
        console.log("Public schema error:", publicError);

    } catch (err) {
        console.error("Unexpected error:", err);
    }
}

testQuery();