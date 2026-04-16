const axios = require('axios');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

class JavaSubmission {
    constructor() {
        this.files = [];      // stores the list of java file URLs
        this.code  = "";      // stores the combined decoded code
    }

    async fetchFiles() {
        
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

    async loadCode() {
        // ... fetchAndDecodeFiles logic goes here
    }
}

module.exports = JavaSubmission;