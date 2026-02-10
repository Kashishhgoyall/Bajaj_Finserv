require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const YOUR_EMAIL = "kashish1393.be23@chitkara.edu.in"; 


app.get("/health", (req, res) => {
  res.json({ is_success: true, official_email: YOUR_EMAIL });
});

app.post("/bfhl", async (req, res) => {
  const keys = Object.keys(req.body);
  if (keys.length !== 1) {
    return res.status(400).json({
      is_success: false,
      official_email: YOUR_EMAIL,
      error: "Request must have exactly one key."
    });
  }

  const key = keys[0];
  const value = req.body[key];

  try {
    let result;
    switch(key) {
      case "fibonacci":
        if (typeof value !== "number" || value < 0) throw "Invalid input";
        result = fibonacci(value);
        break;
      case "prime":
        if (!Array.isArray(value)) throw "Invalid input";
        result = value.filter(isPrime);
        break;
      case "lcm":
        if (!Array.isArray(value)) throw "Invalid input";
        result = computeLCM(value);
        break;
      case "hcf":
        if (!Array.isArray(value)) throw "Invalid input";
        result = computeHCF(value);
        break;
      case "AI":
        if (typeof value !== "string") throw "Invalid input";
        result = await askAI(value);
        break;
      default:
        throw "Unknown key";
    }

    res.json({ is_success: true, official_email: YOUR_EMAIL, data: result });
  } catch (err) {
    res.status(400).json({ is_success: false, official_email: YOUR_EMAIL, error: err.toString() });
  }
});

function fibonacci(n) {
  const arr = [];
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    arr.push(a);
    [a, b] = [b, a + b];
  }
  return arr;
}

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i*i <= n; i++) if (n % i === 0) return false;
  return true;
}

function gcd(a,b){ return b===0?a:gcd(b,a%b);}
function computeHCF(arr){ return arr.reduce((a,b)=>gcd(a,b)); }
function computeLCM(arr){ return arr.reduce((a,b)=>Math.abs(a*b)/gcd(a,b)); }

async function askAI(question){
  const API_KEY = process.env.GEMINI_API_KEY; 
  if(!API_KEY) throw "GEMINI_API_KEY not set in .env";

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateText?key=${API_KEY}`;

  const payload = {
    prompt: question,
    maxOutputTokens: 50
  };

  try {
    const response = await axios.post(url, payload);
    return response.data.candidates[0].output.trim().split(" ")[0]; 
  } catch(err) {
    throw `Gemini API Error: ${err.response?.data?.error?.message || err.message}`;
  }
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
