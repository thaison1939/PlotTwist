const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const cookieParser = require("cookie-parser");
require('dotenv').config()

const app = express();
const PORT = 5000;

app.use(cors());
app.use(cookieParser());

const supabase = createClient(
    process.env.projectURL,
    process.env.supabaseApiKey
);

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function getUnseenCelebsId(req, res) {
    let seenCelebs = [];
    try {
        seenCelebs = req.cookies.seenCelebs ? JSON.parse(req.cookies.seenCelebs) : [];
    } catch (e) {
        console.error("Invalid cookie of seenCelebs");
        seenCelebs = [];
    }

    if (!Array.isArray(seenCelebs) || seenCelebs.some(id => !Number.isInteger(id))) {
        seenCelebs = [];
    }

    let query = supabase.from("celebrities").select("id").limit(1);
    if (seenCelebs.length > 0) {
      query = query.not("id", "in", `(${seenCelebs.join(",")})`);
    }

    const { data, error } = await query;

    if (error || !data ) {
        return { error: "Celebrities ID not found!" };
    }

    if (data.length === 0 ) {
        return { error: "Thank you! You have answered all the available questions!"};
    }

    const unseenCelebs = data.map(celeb => celeb.id).filter(id => !seenCelebs.includes(id));

    if (unseenCelebs.length === 0) {
        return { error: "No more unseen celebrities!"};
    }

    const randomCelebId = unseenCelebs[Math.floor(Math.random() * unseenCelebs.length)];

    seenCelebs.push(randomCelebId);
    res.cookie(
        "seenCelebs", 
        JSON.stringify(seenCelebs), 
        {   
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 2 * 60 * 60 * 1000

        });

    return { celebId: randomCelebId }
}

async function getCelebWithStatements(celebId) {
    const { data: CelebData, error: CelebError} = await supabase
        .from("celebrities")
        .select("id, name, img_url")
        .eq("id", celebId)
        .limit(1)
        .single();

    if (CelebError || !CelebData) {
        return { error: "Celebrity not found!" };
    }

    const { data: statementsData, error: statementsError } = await supabase 
        .from("statements") 
        .select("statement, is_true")
        .eq("celeb_id", celebId);

    if (statementsError || !statementsData) {
        return { error: "Statement not found!" };
    }

    const shuffledStatements = shuffleArray(statementsData);
    
    return { celebrity: CelebData, statements: shuffledStatements };
}


app.get("/api/questions", async(req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Token ") ) {
            return res.status(403).json({ error: "Forbidden: Invalid authentication header"});
        }

        const apiKey = authHeader.split(" ")[1]; 

        if (apiKey !== process.env.apiKey) {
            return res.status(403).json({ error: "Forbidden: Invalid api key"});
        }

        const {celebId, error: CelebError} = await getUnseenCelebsId(req, res);
        if (CelebError) {
            return res.status(404).json({ error: CelebError});
        }

        const {celebrity, statements, error: StatementError} = await getCelebWithStatements(celebId);
        if (StatementError) {
            return res.status(404).json({error: StatementError});
        }

        res.json({celebrity, statements});
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Internal Server Error"});
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));