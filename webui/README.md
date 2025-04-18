# 医学影像诊断平台

这是一个基于多模态大模型和YOLO目标检测的医学影像诊断平台，能够对上传的医学影像进行智能分析和诊断。

## 技术栈

- 前端：Next.js、TypeScript、MUI、React-Dropzone、Axios
- 后端：Next.js API Routes
- 模型：通义千问多模态大模型 (Qwen-VL)、YOLO目标检测（开发中）

## 功能特点

- 简洁直观的用户界面
- 拖拽上传医学影像
- 使用多模态大模型进行智能分析
- 结构化的诊断结果展示
- 支持详细分析和原始数据查看
- YOLO目标检测（即将上线）

## 安装与运行

1. 安装依赖：
   ```bash
   yarn install
   ```

2. 配置环境变量：
   在 `.env.local` 文件中设置：
   ```
   OPENAI_API_KEY=your_api_key
   OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
   QWEN_MODEL=qwen-vl-max
   ```

3. 启动开发服务器：
   ```bash
   yarn dev
   ```

4. 访问 `http://localhost:3000` 开始使用

## 项目结构

- `/src/pages/index.tsx` - 主页面
- `/src/pages/api/analyze.ts` - 图像分析API
- `/src/styles/globals.css` - 全局样式
- `/public` - 静态资源

## 未来计划

- 集成YOLO目标检测
- 添加用户认证
- 历史记录功能
- 支持更多医学影像格式
- 多模型比较功能 