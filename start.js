const axios = require('axios');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const github = axios.create({
    baseURL: `https://api.github.com/repos/aya-alharazin/IUG-Advanced-Java-Object-Oriented-Programming-Review`,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });







async function getJavaFiles() {
  try {
    const repoRes = await github.get(`https://api.github.com/repos/aya-alharazin/IUG-Advanced-Java-Object-Oriented-Programming-Review`);
    
    const branch = repoRes.data.default_branch;
    console.log(branch);
    
    // 2) Get full tree
    const treeRes = await github.get(
      `https://api.github.com/repos/aya-alharazin/IUG-Advanced-Java-Object-Oriented-Programming-Review/git/trees/${branch}?recursive=1`
    );
    console.log(treeRes);
    
    const tree = treeRes.data.tree;
    
    // 3) Keep only code files
    const codeFiles = tree.filter(item =>
      item.type === 'blob' &&
      (
       item.path.endsWith('.java'))
    );
    console.log(codeFiles);
    
     return codeFiles.map(file => file.url);
  }catch (error) {
    console.error('Error:', error.message);
  }
}





getJavaFiles()
    .then(javaFilesArray=>{
        
         async function readJavaFile() {
            console.log(javaFilesArray);
            let codeStr="";
            for  (const javaFile of javaFilesArray) {
                const res = await github.get(
                    javaFile
                  );
                  const contentBase64 = res.data.content;
                  const code = Buffer.from(contentBase64, 'base64').toString('utf-8');
                  codeStr+=code;
                  
                  
            }
            console.log(codeStr);
            
            return codeStr
         }
        
        
         readJavaFile()
            .then((code)=>{
                
                async function analyzeCode(code) {
                    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                
                    const prompt = `
                
                    
You are an expert advanced java instructor.

TASK:
Evaluate the following student code based on the assignment.

INPUT:
Assignment Description: review java


Max Score:
20

Student Code:
${code}

OUTPUT:
Return ONLY valid JSON in this exact format:

{
  "score": number,
  "strengths": ["string", "string", "string"],
  "improvements": ["string", "string", "string"]
}

RULES:
- Score must be between 0 and {{max_score}}
- Be concise and specific
- Do not include any text outside the JSON

                `;
                  try{
                    const result = await model.generateContent(prompt);
                
                    const text = result.response.text();
                
                    console.log(text);
                
                    return text;
                  }catch(err){
                    console.log();
                    
                    }
                }




                analyzeCode(code);
                






                
            })
         
         

    })





