# 智能健身倒计时助手

[Demo截图](./MP3/屏幕截图(2).png)

## 功能特性

✅ **智能训练模式**  
🔁 自动循环4组训练/休息间隔  
📅 每日智能训练计划推荐  
🏋️ 动作分解与进度追踪

🎛️ **独立计时器模式**  
⏱️ 自定义任意时长倒计时  
🔔 声音/震动提醒  
📲 PWA渐进式网页应用支持

## 技术栈

- 🖥️ 前端框架：HTML5 + Tailwind CSS
- 🎨 交互设计：CSS动画 + 响应式布局
- ⚙️ 核心逻辑：Vanilla JavaScript
- 📦 离线支持：Service Worker (PWA)

## 快速开始

### 安装步骤
```bash
# 克隆仓库
git clone https://github.com/yourusername/countdown-no-alert.git

# 进入项目目录
cd countdown-no-alert/v1

# 安装依赖（可选）
npm install -g live-server
```

### 启动方式
1. 使用VS Code + Live Server插件
2. 或执行命令：
```bash
python -m http.server 8000
```
访问 http://localhost:8000/v1/index.html

## 使用指南

### 训练模式
1. 点击"开始训练"启动首轮训练
2. 完成锻炼后点击"完成"进入休息
3. 休息结束自动进入下一轮
4. 支持空格键/R键快捷操作

### 独立计时器
1. 切换至"独立计时"标签
2. 设置分钟/秒数
3. 点击开始倒计时
4. 自定义提示音效

## 核心配置
```javascript
// script.js 核心配置项
const config = {
  DEFAULT_CYCLES: 4,
  WORK_DURATION: 60, // 秒
  REST_DURATION: 90,
  SOUNDS: {
    complete: 'mp3/xylophone.mp3',
    alert: 'mp3/down_fail.mp3'
  }
};
```

## 贡献指南
欢迎通过Issue提交：
- 🐛 Bug反馈  
- 💡 功能建议  
- 📚 文档改进

## 许可协议
[MIT License](LICENSE)
