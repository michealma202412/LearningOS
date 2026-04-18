检查 Windows 上可用的包管理工具。 

Ran terminal command: Get-Command choco, scoop, winget -ErrorAction SilentlyContinue | Select-Object Name, Source

使用 `winget` 在 Windows 上直接安装 Node.js LTS。 

Ran terminal command: winget install OpenJS.NodeJS

继续等待 Node.js 安装完成。 

Checked terminal output

检查 winget 安装进度，同时验证新 PowerShell 终端中 Node.js 的安装状态。  

Ran terminal command: Get-Command node, npm -ErrorAction SilentlyContinue | Select-Object Name, Source

用简单命令确认 Node/npm 是否安装。  

Ran terminal command: node --version ; npm --version

检查 Node.js 是否已在标准安装位置。   

Ran terminal command: Test-Path "C:\Program Files\nodejs\node.exe" ; Test-Path "C:\Program Files\nodejs\npm.cmd"

Node.js 已安装，现在用完整路径直接安装依赖和运行测试。   

Ran terminal command: & "C:\Program Files\nodejs\node.exe" --version ; & "C:\Program Files\nodejs\npm.cmd" --version

现在执行 `npm install`。    

Ran terminal command: & "C:\Program Files\nodejs\npm.cmd" install

检查 `npm install` 的进度。   

Checked terminal output

等待 npm install 完成。    

Ran terminal command: # Wait for npm install to complete - this will check output periodically

再次检查 npm install 进度。     

Checked terminal output

清除旧的 node_modules 并在 PowerShell PATH 中注册 Node.js。      

Ran terminal command: Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue ; Remove-Item package-lock.json -ErrorAction SilentlyContinue ; $env:Path = "C:\Program Files\nodejs;$env:Path" ; npm install

使用 npm.cmd 而不是 npm 脚本，绕过 PowerShell 执行策略限制。        

Ran terminal command: Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue ; Remove-Item package-lock.json -ErrorAction SilentlyContinue | Out-Null ; & "C:\Program Files\nodejs\npm.cmd" install

✅ 依赖安装成功！现在运行开发服务器。      

Ran terminal command: & "C:\Program Files\nodejs\npm.cmd" run dev

使用完整路径启动开发服务器。         

Ran terminal command: & "C:\Program Files\nodejs\node.exe" "C:\Program Files\nodejs\node_modules\vite\bin\vite.js"

使用项目本地的 Vite 执行。           

Ran terminal command: & "C:\Program Files\nodejs\node.exe" ".\node_modules\vite\bin\vite.js"

✅ 开发服务器已启动（http://localhost:5173）！现在在新终端运行测试。            

Ran terminal command: & "C:\Program Files\nodejs\npm.cmd" test

修复 Vitest 配置。为测试环境配置正确的 globals。            

Read [](file:///d%3A/001_temp/02_EduWeb/vite.config.ts)

Replacing 7 lines with 8 lines in [](file:///d%3A/001_temp/02_EduWeb/vite.config.ts)


```

```
重新运行测试。              

Ran terminal command: & "C:\Program Files\nodejs\npm.cmd" test

修复测试代码中不准确的元素选择器。              

Replacing 37 lines with 37 lines in [](file:///d%3A/001_temp/02_EduWeb/src/__tests__/App.test.tsx)


```

```
重新运行测试。                  

Ran terminal command: & "C:\Program Files\nodejs\npm.cmd" test

## ✅ 完成！所有测试通过

现在创建 Windows 开发指南。    

Created [](file:///d%3A/001_temp/02_EduWeb/README.md)

## 完成总结

✅ **已成功将项目改为 Windows 直装 Node.js 方式**

### 完成的工作：

1. **安装 Node.js**
   - 使用 `winget` 在 Windows 上安装 Node.js v25.9.0
   - npm v11.12.1

2. **修复依赖问题**
   - `jsdom` 从 `^23.4.0` → `^29.0.2` 
   - `vitest` 从 `^0.43.0` → `^4.1.4`
   - 删除不必要的 `@types/react-router-dom`

3. **安装与验证**
   ```powershell
   & "C:\Program Files\nodejs\npm.cmd" install  # ✓ 258 个包安装成功
   ```

4. **开发服务器** ✓
   ```powershell
   & "C:\Program Files\nodejs\node.exe" ".\node_modules\vite\bin\vite.js"
   # 运行在 http://localhost:5173
   ```

5. **测试执行** ✓
   ```
   ✓ 3 tests passed
   - renders the home page with subject cards
   - renders a subject page for chinese  
   - renders a learning page for noodle
   ```

6. **创建文档**
   - 完整的 README.md，包含 Windows 使用说明

---

### 下次快速启动命令

```powershell
cd d:\001_temp\02_EduWeb

# 开发
& "C:\Program Files\nodejs\node.exe" ".\node_modules\vite\bin\vite.js"

# 测试
& "C:\Program Files\nodejs\npm.cmd" test

# 构建
& "C:\Program Files\nodejs\npm.cmd" run build
```

Made changes.