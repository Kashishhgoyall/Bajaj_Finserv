require("dotenv").config();
const express = require("express");
const axios = require("axios");
const helmet = require("helmet");
const cors = require("cors");

const app = express();


app.use(express.json());
app.use(helmet());
app.use(cors());


const EMAIL = "kashish1393.be23@chitkara.edu.in";



const fibonacci = (n) => {
    if (n < 0) return [];
    let res = [0,1];
    for (let i = 2; i < n; i++) res.push(res[i-1]+res[i-2]);
    return res.slice(0,n);
};

const isPrime = (n) => {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++)
        if (n % i === 0) return false;
    return true;
};

const gcd = (a,b) => b===0 ? a : gcd(b,a%b);

const hcf = (arr) => arr.reduce((a,b)=>gcd(a,b));

const lcm = (arr) =>
    arr.reduce((a,b)=>(Math.abs(a*b))/gcd(a,b));



app.get("/health", (req,res)=>{
    res.status(200).json({
        is_success:true,
        official_email: EMAIL
    });
});



async function askAI(question){
    if(!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set in .env");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`;

    try {
        const response = await axios.post(url,{
            contents:[{
                parts:[{text: question}]
            }]
        });

        const text = response.data.candidates[0].content.parts[0].text;

       
        let words = text.trim().split(" ");
        let lastWord = words[words.length - 1];

        
        lastWord = lastWord.replace(/[\.\?\!\*]/g, "");

        return lastWord;
    } catch(err) {
        throw new Error(`Gemini API Error: ${err.response?.data?.error?.message || err.message}`);
    }
}




app.post("/bfhl", async (req,res)=>{
    try{
        const body = req.body;
        const keys = Object.keys(body);

        if(keys.length !== 1){
            return res.status(400).json({
                is_success:false,
                official_email:EMAIL,
                message:"Exactly one key required"
            });
        }

        let data;

        if(body.fibonacci !== undefined){
            if(typeof body.fibonacci !== "number" || body.fibonacci < 0)
                throw new Error("Invalid input for fibonacci");

            data = fibonacci(body.fibonacci);
        }
        else if(body.prime !== undefined){
            if(!Array.isArray(body.prime))
                throw new Error("Invalid input for prime");

            data = body.prime.filter(isPrime);
        }
        else if(body.lcm !== undefined){
            if(!Array.isArray(body.lcm))
                throw new Error("Invalid input for lcm");

            data = lcm(body.lcm);
        }
        else if(body.hcf !== undefined){
            if(!Array.isArray(body.hcf))
                throw new Error("Invalid input for hcf");

            data = hcf(body.hcf);
        }
        else if(body.AI !== undefined){
            if(typeof body.AI !== "string")
                throw new Error("Invalid input for AI");

            data = await askAI(body.AI); 
        }
        else{
            return res.status(400).json({
                is_success:false,
                official_email:EMAIL,
                message:"Unknown key"
            });
        }

        res.status(200).json({
            is_success:true,
            official_email:EMAIL,
            data: data
        });

    } catch(err){
        res.status(500).json({
            is_success:false,
            official_email:EMAIL,
            message: err.message
        });
    }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
});
