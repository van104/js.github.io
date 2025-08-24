// 网易云音乐启动功能
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('launchMusic')) {
        document.getElementById('launchMusic').addEventListener('click', function() {
            // 尝试使用自定义协议启动网易云音乐
            window.location.href = 'neteasemusic://';
        });
    }
});

tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#2563EB',
                workout: '#059669',
                rest: '#D97706',
                dark: '#111827',
                light: '#F3F4F6'
            },
            fontFamily: {
                inter: ['Inter', 'system-ui', 'sans-serif'],
            }
        }
    }
};

const appState = {
    totalCycles: 4,
    currentCycle: 1,
    isRunning: false,
    isResting: false,
    timer: null,
    audioInstance: null,
    clickSound: new Audio('/MP3/down_fail.mp3'),
    seconds: 60,

    currentExerciseIndex: 0,
    currentPlan: null,
    exercises: []
};

const dom = {
    startBtn: document.getElementById('start-btn'),
    resetBtn: document.getElementById('reset-btn'),
    displayArea: document.getElementById('display-area'),
    statusText: document.getElementById('status-text'),
    cycleCounter: document.getElementById('cycle-counter'),
    message: document.getElementById('message'),
    timerCard: document.getElementById('timer-card')
};

function updateDisplay() {
    if (appState.isResting) {
        const mins = Math.floor(appState.seconds / 60);
        const secs = appState.seconds % 60;
        dom.displayArea.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        document.title = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} - 健身倒计时`;
    } else {
        dom.displayArea.textContent = '锻炼中';
        document.title = `锻炼中 - 智能健身倒计时`;
    }
}

function updateCycleCounter() {
    dom.cycleCounter.textContent = `循环 ${appState.currentCycle}/${appState.totalCycles}`;
    dom.cycleCounter.classList.toggle('bg-primary/10', !appState.isResting);
    dom.cycleCounter.classList.toggle('bg-rest/10', appState.isResting);
}

function getCurrentDay() {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const today = new Date();
    return days[today.getDay()];
}

function getTodayPlan() {
    const today = getCurrentDay();
    if (today === '周日') {
        return { isRestDay: true };
    }
    return trainingPlans.find(plan => plan.days && plan.days.includes(today)) || { isNoPlan: true };
}

function updateWorkoutModeHeader() {
    const today = getCurrentDay();
    const todayPlan = getTodayPlan();
    
    if (today === '周日') {
        dom.statusText.textContent = '今天是休息日，好好放松！';
        dom.displayArea.textContent = '休息日';
        dom.startBtn.disabled = true;
        dom.startBtn.innerHTML = '<i class="fa fa-play fa-lg"></i><span class="text-lg font-medium">今日休息</span>';
        dom.message.textContent = '休息日也是训练计划的一部分，让身体充分恢复';
        return;
    }

    if (todayPlan.isNoPlan) {
        dom.statusText.textContent = `今天(${today})没有安排训练`;
        dom.displayArea.textContent = '自由训练';
        dom.startBtn.innerHTML = '<i class="fa fa-play fa-lg"></i><span class="text-lg font-medium">开始训练</span>';
        dom.message.textContent = '可以使用独立计时器进行自由训练';
        return;
    }

    dom.statusText.textContent = `准备开始训练: ${todayPlan.title}`;
    dom.displayArea.textContent = '点击开始';
    dom.startBtn.innerHTML = '<i class="fa fa-play fa-lg"></i><span class="text-lg font-medium">开始训练</span>';
    dom.message.textContent = '准备就绪，点击开始进入第一轮训练';
}

function startWorkout() {
    appState.clickSound.currentTime = 0;
    appState.clickSound.play();

    if (appState.isRunning) {
        // 如果正在运行，完成当前阶段
        clearInterval(appState.timer);
        
        if (appState.isResting) {
            // 完成休息，进入下一轮
            appState.isResting = false;
            startNextCycle();
        } else {
            // 完成锻炼，进入休息
            appState.isRunning = false;
            switchToRest();
        }
        return;
    }

    // 开始新的训练
    appState.isRunning = true;
    appState.isResting = false;
    
    const todayPlan = getTodayPlan();
    if (!appState.currentPlan) {
        appState.currentPlan = todayPlan;
        appState.exercises = todayPlan.exercises;
        appState.currentExerciseIndex = 0;
    }
    // 如果是继续训练，则保持currentExerciseIndex不变

    updateExerciseDisplay();
    dom.timerCard.classList = 'bg-white/90 backdrop-blur-lg rounded-3xl p-10 card-shadow border-2 border-workout/20';
    dom.message.textContent = '专注锻炼，完成后点击按钮进入休息';
    dom.startBtn.innerHTML = '<i class="fa fa-flag-checkered fa-lg"></i><span class="text-lg font-medium">完成锻炼</span>';
    updateCycleCounter();

    if (appState.timer) clearInterval(appState.timer);
}

function updateExerciseDisplay() {
    if (!appState.currentPlan || appState.exercises.length === 0) return;

    const currentExercise = appState.exercises[appState.currentExerciseIndex];
    dom.statusText.textContent = `${getCurrentDay()} - ${appState.currentPlan.title} - ${currentExercise.name}`;
    dom.statusText.classList = 'text-2xl font-bold text-workout';
    dom.displayArea.textContent = '锻炼中';
    dom.displayArea.classList = 'text-7xl font-black text-workout timer-pulse';
}

function switchToRest() {
    appState.isRunning = false;
    appState.isResting = true;
    appState.seconds = appState.currentCycle === 4 ? 90 : 60;
    dom.statusText.textContent = '休息恢复中';
    dom.statusText.classList = 'text-2xl font-bold text-rest';
    dom.displayArea.classList = 'text-7xl font-black text-rest timer-pulse';
    dom.timerCard.classList = 'bg-white/90 backdrop-blur-lg rounded-3xl p-10 card-shadow border-2 border-rest/20';
    dom.message.textContent = appState.currentCycle === 4 ? '当前工作已完成，准备下一个动作' : '适当休息，准备下一轮训练';
    dom.startBtn.innerHTML = '<i class="fa fa-clock-o fa-lg"></i><span class="text-lg font-medium">休息计时中</span>';
    dom.startBtn.disabled = true;

    appState.timer = setInterval(() => {
        if (appState.seconds <= 0) {
            clearInterval(appState.timer);
            // 停止任何正在播放的音频
            if (appState.audioInstance) {
                appState.audioInstance.pause();
                appState.audioInstance = null;
            }
            // 创建新的音频实例并播放
            appState.audioInstance = new Audio('https://clockcn.com/sound/xylophone.mp3');
            appState.audioInstance.loop = true;
            appState.audioInstance.play();
            handleCycleCompletion();
            return;
        }
        
        if (appState.seconds <= 10) {
            dom.displayArea.classList.add('animate-pulse');
        } else {
            dom.displayArea.classList.remove('animate-pulse');
        }
        
        appState.seconds--;
        updateDisplay();
    }, 1000);
}

function handleCycleCompletion() {
    if (appState.currentCycle < appState.totalCycles) {
        appState.currentCycle++;
        dom.statusText.textContent = '休息结束';
        dom.displayArea.textContent = '点击开始';
        dom.displayArea.classList = 'text-7xl font-black text-workout';
        dom.message.textContent = '已完成当前轮次，点击开始下一轮训练';
        dom.startBtn.innerHTML = '<i class="fa fa-play fa-lg"></i><span class="text-lg font-medium">开始下一轮</span>';
        dom.startBtn.disabled = false;
        appState.isRunning = false;
        appState.isResting = false;
    } else {
        completeAllCycles();
    }
}

function completeAllCycles() {
    clearInterval(appState.timer);
    appState.isRunning = false;
    appState.isResting = false;
    appState.currentCycle = 1;
    updateCycleCounter();

    // 检查是否有下一个动作
    if (appState.currentExerciseIndex < appState.exercises.length - 1) {
        appState.currentExerciseIndex++;
        dom.statusText.textContent = `准备下一个动作: ${appState.exercises[appState.currentExerciseIndex].name}`;
        dom.displayArea.textContent = '点击开始';
        dom.displayArea.classList = 'text-7xl font-black text-workout';
        dom.message.textContent = '已完成所有轮次，准备下一个动作';
        dom.startBtn.innerHTML = '<i class="fa fa-play fa-lg"></i><span class="text-lg font-medium">开始训练</span>';
        dom.startBtn.disabled = false;
    } else {
        // 所有动作都已完成
        dom.statusText.textContent = '恭喜完成所有训练！';
        dom.displayArea.textContent = '已完成';
        dom.displayArea.classList = 'text-7xl font-black text-primary';
        dom.message.textContent = '今天的训练计划已全部完成，真棒！';
        dom.startBtn.innerHTML = '<i class="fa fa-refresh fa-lg"></i><span class="text-lg font-medium">重新开始</span>';
        dom.startBtn.disabled = false;
        
        // 重置训练状态，以便重新开始
        appState.currentPlan = null;
        appState.currentExerciseIndex = 0;
        appState.exercises = [];
    }

    // 停止提示音
    if (appState.audioInstance) {
        appState.audioInstance.pause();
        appState.audioInstance = null;
    }
}

function startNextCycle() {
    appState.isRunning = true;
    appState.isResting = false;
    updateExerciseDisplay();
    dom.timerCard.classList = 'bg-white/90 backdrop-blur-lg rounded-3xl p-10 card-shadow border-2 border-workout/20';
    dom.message.textContent = '专注锻炼，完成后点击按钮进入休息';
    dom.startBtn.innerHTML = '<i class="fa fa-flag-checkered fa-lg"></i><span class="text-lg font-medium">完成锻炼</span>';
    dom.startBtn.disabled = false;
    updateCycleCounter();
}

function resetWorkout() {
    clearInterval(appState.timer);
    appState.isRunning = false;
    appState.isResting = false;
    appState.currentCycle = 1;
    appState.currentExerciseIndex = 0;
    appState.currentPlan = null;
    appState.exercises = [];
    
    updateWorkoutModeHeader();
    updateCycleCounter();
    dom.displayArea.classList = 'text-7xl font-black text-workout';
    dom.timerCard.classList = 'bg-white/90 backdrop-blur-lg rounded-t-none rounded-3xl p-10 card-shadow -mt-2 relative z-0';
    
    // 停止任何正在播放的音频
    if (appState.audioInstance) {
        appState.audioInstance.pause();
        appState.audioInstance = null;
    }
    
    appState.clickSound.currentTime = 0;
    appState.clickSound.play();
    dom.resetBtn.classList.add('btn-bounce');
    setTimeout(() => {
        dom.resetBtn.classList.remove('btn-bounce');
    }, 300);
}

// 事件监听
dom.startBtn.addEventListener('click', startWorkout);
dom.resetBtn.addEventListener('click', resetWorkout);

// 声明全局变量
let timerDom = null;
let updateTimerDisplay = null;
let startTimer = null;
let resetTimer = null;
let switchMode = null;
let trainingPlans = [];

// 确保DOM加载完成后再获取元素
document.addEventListener('DOMContentLoaded', function() {
    // 从localStorage加载训练计划数据
    trainingPlans = JSON.parse(localStorage.getItem('trainingPlans')) || [
        {
            id: 'plan1',
            date: '2023-10-23',
            day: '周一',
            title: '上肢力量训练',
            exercises: [
                { id: 'ex1-1', name: '俯卧撑', sets: 4, reps: '12-15', rest: '60秒' },
                { id: 'ex1-2', name: '引体向上', sets: 3, reps: '8-10', rest: '90秒' },
                { id: 'ex1-3', name: '哑铃弯举', sets: 3, reps: '10-12', rest: '60秒' },
                { id: 'ex1-4', name: '三头肌臂屈伸', sets: 3, reps: '12-15', rest: '60秒' }
            ]
        },
        {
            id: 'plan2',
            date: '2023-10-24',
            day: '周二',
            title: '下肢力量训练',
            exercises: [
                { id: 'ex2-1', name: '深蹲', sets: 4, reps: '10-12', rest: '90秒' },
                { id: 'ex2-2', name: '箭步蹲', sets: 3, reps: '10-12/腿', rest: '60秒' },
                { id: 'ex2-3', name: '硬拉', sets: 3, reps: '8-10', rest: '120秒' },
                { id: 'ex2-4', name: '提踵', sets: 4, reps: '15-20', rest: '45秒' }
            ]
        },
        {
            id: 'plan3',
            date: '2023-10-25',
            day: '周三',
            title: '核心训练',
            exercises: [
                { id: 'ex3-1', name: '平板支撑', sets: 3, reps: '60秒', rest: '45秒' },
                { id: 'ex3-2', name: '仰卧起坐', sets: 3, reps: '15-20', rest: '45秒' },
                { id: 'ex3-3', name: '俄罗斯转体', sets: 3, reps: '20/侧', rest: '45秒' },
                { id: 'ex3-4', name: '悬挂举腿', sets: 3, reps: '10-12', rest: '60秒' }
            ]
        },
        {
            id: 'plan4',
            date: '2023-10-26',
            day: '周四',
            title: '有氧训练',
            exercises: [
                { id: 'ex4-1', name: '慢跑', sets: 1, reps: '30分钟', rest: '0秒' },
                { id: 'ex4-2', name: '跳绳', sets: 5, reps: '1分钟', rest: '30秒' },
            ]
        }
    ];

    // 保存训练计划到localStorage
    function saveTrainingPlans() {
        localStorage.setItem('trainingPlans', JSON.stringify(trainingPlans));
    }

    // 添加新训练计划
    function addTrainingPlan(plan) {
        const newPlan = {
            id: 'plan' + Date.now(),
            ...plan,
            date: new Date().toISOString().split('T')[0]
        };
        trainingPlans.push(newPlan);
        saveTrainingPlans();
        renderTrainingPlans();
    }

    // 更新训练计划
    function updateTrainingPlan(planId, updatedPlan) {
        const index = trainingPlans.findIndex(plan => plan.id === planId);
        if (index !== -1) {
            trainingPlans[index] = {...trainingPlans[index], ...updatedPlan};
            saveTrainingPlans();
            renderTrainingPlans();
        }
    }

    // 删除训练计划
    function deleteTrainingPlan(planId) {
        trainingPlans = trainingPlans.filter(plan => plan.id !== planId);
        saveTrainingPlans();
        renderTrainingPlans();
    }

    // 删除所有训练计划
    function deleteAllTrainingPlans() {
        if (confirm('确定要删除所有训练计划吗？此操作不可恢复！')) {
            trainingPlans = [];
            saveTrainingPlans();
            renderTrainingPlans();
        }
    }

    // 渲染训练计划
    function renderTrainingPlans() {
        const planContainer = document.getElementById('daily-plans');
        if (!planContainer) return;

        planContainer.innerHTML = '';

        // 添加操作按钮容器
        const actionButtonsContainer = document.createElement('div');
        actionButtonsContainer.className = 'flex flex-col items-center justify-center gap-4 mb-4';

        // 添加新建计划按钮
        const addButton = document.createElement('div');
        addButton.className = 'bg-primary/10 hover:bg-primary/20 rounded-xl p-5 text-center cursor-pointer transition-colors';
        addButton.innerHTML = `
            <i class="fa fa-plus-circle text-primary text-3xl mb-2"></i>
            <div class="text-primary font-medium">添加新训练计划</div>
        `;
        addButton.addEventListener('click', () => openPlanEditor());
        actionButtonsContainer.appendChild(addButton);

        // 添加删除所有计划按钮
        const deleteAllButton = document.createElement('button');
        deleteAllButton.className = 'bg-red-50 hover:bg-red-100 rounded-full p-3 text-center cursor-pointer transition-colors';
        deleteAllButton.title = '删除所有计划';
        deleteAllButton.innerHTML = `
            <i class="fa fa-trash text-red-500 text-xl"></i>
        `;
        deleteAllButton.addEventListener('click', () => deleteAllTrainingPlans());
        actionButtonsContainer.appendChild(deleteAllButton);

        planContainer.appendChild(actionButtonsContainer);

        trainingPlans.forEach(plan => {
            const planCard = document.createElement('div');
            planCard.className = 'bg-slate-50 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer plan-card mb-4';
            // 移除不再使用的date属性
            planCard.setAttribute('data-id', plan.id);

            planCard.innerHTML = `
                <div class="flex justify-between items-center mb-3">
                    <h3 class="text-xl font-bold text-primary">${plan.title}</h3>
                    <div class="flex space-x-2">
                        <button class="edit-plan-btn text-slate-500 hover:text-primary p-1" data-id="${plan.id}">
                            <i class="fa fa-edit"></i>
                        </button>
                        <button class="delete-plan-btn text-slate-500 hover:text-red-500 p-1" data-id="${plan.id}">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="text-slate-500 text-sm mb-4">星期: ${plan.days ? plan.days.join('、') : '未选择'}</div>
                <div class="plan-details hidden mt-3 space-y-2">
                    <h4 class="font-semibold text-slate-700 mb-2">训练内容:</h4>
                    <div class="overflow-x-auto">
                        <table class="min-w-full bg-white rounded-lg overflow-hidden">
                            <thead class="bg-primary/5">
                                <tr>
                                    <th class="py-2 px-3 text-left text-sm font-medium text-slate-600">完成</th>
                                    <th class="py-2 px-3 text-left text-sm font-medium text-slate-600">动作</th>
                                    <th class="py-2 px-3 text-left text-sm font-medium text-slate-600">组数</th>
                                    <th class="py-2 px-3 text-left text-sm font-medium text-slate-600">次数</th>
                                    <th class="py-2 px-3 text-left text-sm font-medium text-slate-600">休息</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${plan.exercises.map(ex => `
                                    <tr data-exercise-id="${ex.id || Math.random().toString(36).substr(2, 9)}">
                                        <td class="py-2 px-3 text-sm text-slate-700">
                                            <input type="checkbox" class="exercise-checkbox rounded text-primary focus:ring-primary">
                                        </td>
                                        <td class="py-2 px-3 text-sm text-slate-700">${ex.name}</td>
                                        <td class="py-2 px-3 text-sm text-slate-700">${ex.sets}</td>
                                        <td class="py-2 px-3 text-sm text-slate-700">${ex.reps}</td>
                                        <td class="py-2 px-3 text-sm text-slate-700">${ex.rest}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            // 点击卡片展开/折叠详情
            planCard.addEventListener('click', () => {
                const details = planCard.querySelector('.plan-details');
                details.classList.toggle('hidden');
            });

            // 编辑计划
            planCard.querySelector('.edit-plan-btn').addEventListener('click', (event) => {
                event.stopPropagation();
                openPlanEditor(plan.id);
            });

            // 删除计划
            planCard.querySelector('.delete-plan-btn').addEventListener('click', (event) => {
                event.stopPropagation();
                if (confirm('确定要删除这个训练计划吗？')) {
                    deleteTrainingPlan(plan.id);
                }
            });

            planContainer.appendChild(planCard);
        });
    }

    // 打开计划编辑器
    function openPlanEditor(planId = null) {
        // 创建模态框背景
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';

        // 查找要编辑的计划
        const planToEdit = planId ? trainingPlans.find(plan => plan.id === planId) : null;

        // 创建模态框内容
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto';
        modalContent.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-2xl font-bold text-primary">${planId ? '编辑训练计划' : '添加新训练计划'}</h3>
                <button class="close-modal text-slate-500 hover:text-slate-700 p-2" title="关闭窗口"><i class="fa fa-times text-xl"></i></button>
            </div>
            <form id="plan-editor-form" class="space-y-4">
                ${planId ? `<input type="hidden" name="planId" value="${planId}">` : ''}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="plan-title" class="block text-sm font-medium text-slate-700 mb-1">计划标题</label>
                        <input type="text" id="plan-title" name="title" required
                            value="${planToEdit ? planToEdit.title : ''}"
                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary">
                    </div>
                    <!-- 已移除日期输入框 -->
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">训练日</label>
                        <div class="grid grid-cols-3 gap-2">
                            ${['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => `
                                <label class="flex items-center p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                                    <input type="checkbox" name="days" value="${day}" 
                                        ${planToEdit && planToEdit.days && planToEdit.days.includes(day) ? 'checked' : ''}
                                        class="mr-2 text-primary focus:ring-primary">
                                    <span>${day}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">训练动作</label>
                    <div id="exercises-container" class="space-y-4">
                        ${planToEdit && planToEdit.exercises ? planToEdit.exercises.map((ex, index) => `
                            <div class="exercise-item grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border border-slate-200 rounded-lg">
                                <div>
                                    <label class="block text-xs font-medium text-slate-600 mb-1">动作名称</label>
                                    <input type="text" name="exercise-name-${index}" required value="${ex.name}"
                                        class="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-primary focus:border-primary text-sm">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-slate-600 mb-1">组数</label>
                                    <input type="number" name="exercise-sets-${index}" required value="${ex.sets}" min="1"
                                        class="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-primary focus:border-primary text-sm">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-slate-600 mb-1">次数</label>
                                    <input type="text" name="exercise-reps-${index}" required value="${ex.reps}"
                                        class="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-primary focus:border-primary text-sm">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-slate-600 mb-1">休息时间</label>
                                    <input type="text" name="exercise-rest-${index}" required value="${ex.rest}"
                                        class="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-primary focus:border-primary text-sm">
                                </div>
                                <button type="button" class="remove-exercise md:col-start-4 text-red-500 hover:text-red-700 text-sm mt-1 self-end"
                                    data-index="${index}"><i class="fa fa-minus-circle"></i> 删除</button>
                            </div>
                        `).join('') : `
                            <div class="exercise-item grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border border-slate-200 rounded-lg">
                                <div>
                                    <label class="block text-xs font-medium text-slate-600 mb-1">动作名称</label>
                                    <input type="text" name="exercise-name-0" required
                                        class="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-primary focus:border-primary text-sm">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-slate-600 mb-1">组数</label>
                                    <input type="number" name="exercise-sets-0" required value="3" min="1"
                                        class="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-primary focus:border-primary text-sm">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-slate-600 mb-1">次数</label>
                                    <input type="text" name="exercise-reps-0" required value="10-12"
                                        class="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-primary focus:border-primary text-sm">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-slate-600 mb-1">休息时间</label>
                                    <input type="text" name="exercise-rest-0" required value="60秒"
                                        class="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-primary focus:border-primary text-sm">
                                </div>
                            </div>
                        `}
                    </div>
                    <button type="button" id="add-exercise-btn" class="mt-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                        <i class="fa fa-plus mr-1"></i> 添加动作
                    </button>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button type="button" class="cancel-btn px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">取消</button>
                    <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2">保存计划</button>
                </div>
            </form>
        `;

        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        // 关闭模态框
        modalContent.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });
        modalContent.querySelector('.cancel-btn').addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });

        // 添加新动作
        let exerciseCount = planToEdit ? planToEdit.exercises.length : 1;
        modalContent.querySelector('#add-exercise-btn').addEventListener('click', () => {
            const container = modalContent.querySelector('#exercises-container');
            const newExercise = document.createElement('div');
            newExercise.className = 'exercise-item grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border border-slate-200 rounded-lg';
            newExercise.innerHTML = `
                <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">动作名称</label>
                    <input type="text" name="exercise-name-${exerciseCount}" required
                        class="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-primary focus:border-primary text-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">组数</label>
                    <input type="number" name="exercise-sets-${exerciseCount}" required value="3" min="1"
                        class="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-primary focus:border-primary text-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">次数</label>
                    <input type="text" name="exercise-reps-${exerciseCount}" required value="10-12"
                        class="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-primary focus:border-primary text-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">休息时间</label>
                    <input type="text" name="exercise-rest-${exerciseCount}" required value="60秒"
                        class="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-primary focus:border-primary text-sm">
                </div>
                <button type="button" class="remove-exercise md:col-start-4 text-red-500 hover:text-red-700 text-sm mt-1 self-end"
                    data-index="${exerciseCount}"><i class="fa fa-minus-circle"></i> 删除</button>
            `;
            container.appendChild(newExercise);
            exerciseCount++;

            // 为新添加的删除按钮绑定事件
            newExercise.querySelector('.remove-exercise').addEventListener('click', (event) => {
                const index = parseInt(event.currentTarget.dataset.index);
                container.removeChild(newExercise);
            });
        });

        // 删除动作
        modalContent.querySelectorAll('.remove-exercise').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = parseInt(event.currentTarget.dataset.index);
                const item = event.currentTarget.closest('.exercise-item');
                modalContent.querySelector('#exercises-container').removeChild(item);
            });
        });

        // 表单提交 - 修复了保存计划的问题
        modalContent.querySelector('#plan-editor-form').addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            
            const title = formData.get('title');
            const planId = formData.get('planId');
            
            // 获取选中的训练日
            const daysElements = document.querySelectorAll('input[name="days"]:checked');
            const days = Array.from(daysElements).map(el => el.value);
            
            // 收集训练动作
            const exercises = [];
            modalContent.querySelectorAll('.exercise-item').forEach((item, index) => {
                const nameInput = item.querySelector(`input[name="exercise-name-${index}"]`);
                const setsInput = item.querySelector(`input[name="exercise-sets-${index}"]`);
                const repsInput = item.querySelector(`input[name="exercise-reps-${index}"]`);
                const restInput = item.querySelector(`input[name="exercise-rest-${index}"]`);
                
                if (nameInput && setsInput && repsInput && restInput) {
                    exercises.push({
                        id: `ex-${Date.now()}-${index}`,
                        name: nameInput.value,
                        sets: parseInt(setsInput.value),
                        reps: repsInput.value,
                        rest: restInput.value
                    });
                }
            });
            
            if (planId) {
                // 更新现有计划 - 修复了未定义的date变量问题
                updateTrainingPlan(planId, {
                    title,
                    days,
                    exercises
                });
            } else {
                // 添加新计划
                addTrainingPlan({
                    title,
                    days,
                    exercises
                });
            }

            document.body.removeChild(modalOverlay);
        });
    }

    // 独立计时器状态
    const timerState = {
        minutes: 0,
        seconds: 0,
        isRunning: false,
        timer: null,
        endSound: new Audio('https://clockcn.com/sound/xylophone.mp3')
    };

    // 独立计时器DOM元素
    timerDom = {
        workoutTab: document.getElementById('workout-tab'),
        timerTab: document.getElementById('timer-tab'),
        planTab: document.getElementById('plan-tab'),
        workoutMode: document.getElementById('workout-mode'),
        timerMode: document.getElementById('timer-mode'),
        planMode: document.getElementById('plan-mode'),
        timerMinutes: document.getElementById('timer-minutes'),
        timerSeconds: document.getElementById('timer-seconds'),
        timerDisplay: document.getElementById('timer-display'),
        timerStartBtn: document.getElementById('timer-start-btn'),
        timerResetBtn: document.getElementById('timer-reset-btn'),
        timerMessage: document.getElementById('timer-message'),
        timerInput: document.getElementById('timer-input')
    };

    // 更新独立计时器显示
    updateTimerDisplay = function() {
        if (timerDom && timerDom.timerDisplay) {
            timerDom.timerDisplay.textContent = `${timerState.minutes.toString().padStart(2, '0')}:${timerState.seconds.toString().padStart(2, '0')}`;
            timerDom.timerDisplay.classList.toggle('final-countdown', timerState.minutes === 0 && timerState.seconds <= 10);
            document.title = `倒计时 ${timerState.minutes.toString().padStart(2, '0')}:${timerState.seconds.toString().padStart(2, '0')}`;
        }
    };

    // 开始独立计时
    startTimer = function() {
        if (!timerDom) return;
        
        // 停止任何正在播放的声音
        if (timerState.endSound) {
            timerState.endSound.pause();
            timerState.endSound.currentTime = 0;
        }
        
        if (timerState.isRunning) {
            clearInterval(timerState.timer);
            timerState.isRunning = false;
            timerDom.timerStartBtn.innerHTML = '<i class="fa fa-play fa-lg"></i><span class="text-lg font-medium">继续计时</span>';
            timerDom.timerMessage.textContent = '计时已暂停';
            timerDom.timerMinutes.disabled = false;
            timerDom.timerSeconds.disabled = false;
            timerDom.timerInput.disabled = false;
            return;
        }
        
        // 检查时间是否为0
        if (timerState.minutes === 0 && timerState.seconds === 0) {
            timerDom.timerMessage.textContent = '请先设置时间';
            return;
        }
        
        timerState.isRunning = true;
        timerDom.timerStartBtn.innerHTML = '<i class="fa fa-pause fa-lg"></i><span class="text-lg font-medium">暂停计时</span>';
        timerDom.timerMessage.textContent = '计时中...';
        timerDom.timerMinutes.disabled = true;
        timerDom.timerSeconds.disabled = true;
        timerDom.timerInput.disabled = true;
        
        timerState.timer = setInterval(() => {
            if (timerState.seconds === 0) {
                if (timerState.minutes === 0) {
                    // 计时结束
                    clearInterval(timerState.timer);
                    timerState.isRunning = false;
                    timerDom.timerStartBtn.innerHTML = '<i class="fa fa-play fa-lg"></i><span class="text-lg font-medium">重新开始</span>';
                    timerDom.timerMessage.textContent = '计时结束!';
                    timerDom.timerMinutes.disabled = false;
                    timerDom.timerSeconds.disabled = false;
                    timerDom.timerInput.disabled = false;
                    
                    // 播放结束提示音
                    timerState.endSound.loop = true;
                    timerState.endSound.play();
                    
                    return;
                }
                timerState.minutes--;
                timerState.seconds = 59;
            } else {
                timerState.seconds--;
            }
            
            updateTimerDisplay();
        }, 1000);
    };

    // 重置独立计时器
    resetTimer = function() {
        if (!timerDom) return;
        
        clearInterval(timerState.timer);
        timerState.isRunning = false;
        timerState.minutes = 0;
        timerState.seconds = 0;
        timerDom.timerMinutes.value = 0;
        timerDom.timerSeconds.value = 0;
        timerDom.timerInput.value = 0;
        updateTimerDisplay();
        timerDom.timerStartBtn.innerHTML = '<i class="fa fa-play fa-lg"></i><span class="text-lg font-medium">开始计时</span>';
        timerDom.timerStartBtn.disabled = false;
        timerDom.timerMinutes.disabled = false;
        timerDom.timerSeconds.disabled = false;
        timerDom.timerInput.disabled = false;
        

        if (timerState.endSound) {
            timerState.endSound.pause();
            timerState.endSound.currentTime = 0;
        }

        appState.clickSound.currentTime = 0;
        appState.clickSound.play();
        timerDom.timerResetBtn.classList.add('btn-bounce');
        setTimeout(() => {
            timerDom.timerResetBtn.classList.remove('btn-bounce');
        }, 300);
    };

    // 切换模式 - 修复模式切换异常问题
    switchMode = function(mode) {
        if (!timerDom) return;
        
        // 隐藏所有模式
        timerDom.workoutMode.classList.add('hidden');
        timerDom.timerMode.classList.add('hidden');
        timerDom.planMode.classList.add('hidden');
        
        // 移除所有模式的动画类
        timerDom.workoutMode.classList.remove('mode-enter', 'mode-enter-active', 'mode-exit-active');
        timerDom.timerMode.classList.remove('mode-enter', 'mode-enter-active', 'mode-exit-active');
        timerDom.planMode.classList.remove('mode-enter', 'mode-enter-active', 'mode-exit-active');
        
        // 显示目标模式
        let targetMode;
        if (mode === 'workout') {
            targetMode = timerDom.workoutMode;
        } else if (mode === 'timer') {
            targetMode = timerDom.timerMode;
        } else if (mode === 'plan') {
            targetMode = timerDom.planMode;
        }
        
        // 准备目标模式的进入动画
        targetMode.classList.remove('hidden');
        targetMode.classList.add('mode-enter');
        
        // 触发重排后添加进入动画类
        setTimeout(() => {
            targetMode.classList.remove('mode-enter');
            targetMode.classList.add('mode-enter-active');
        }, 10);
        
        // 更新标签样式
        if (mode === 'workout') {
            timerDom.workoutTab.classList.add('text-primary', 'border-b-2', 'border-primary');
            timerDom.workoutTab.classList.remove('text-slate-500');
            timerDom.timerTab.classList.add('text-slate-500');
            timerDom.timerTab.classList.remove('text-primary', 'border-b-2', 'border-primary');
            timerDom.planTab.classList.add('text-slate-500');
            timerDom.planTab.classList.remove('text-primary', 'border-b-2', 'border-primary');
            document.title = '智能健身倒计时';
        } else if (mode === 'timer') {
            timerDom.workoutTab.classList.add('text-slate-500');
            timerDom.workoutTab.classList.remove('text-primary', 'border-b-2', 'border-primary');
            timerDom.timerTab.classList.add('text-primary', 'border-b-2', 'border-primary');
            timerDom.timerTab.classList.remove('text-slate-500');
            timerDom.planTab.classList.add('text-slate-500');
            timerDom.planTab.classList.remove('text-primary', 'border-b-2', 'border-primary');
            updateTimerDisplay();
        } else if (mode === 'plan') {
            // 确保计时器已暂停
            if (timerState.isRunning) {
                clearInterval(timerState.timer);
                timerState.isRunning = false;
                if (timerDom) {
                    timerDom.timerStartBtn.innerHTML = '<i class="fa fa-play fa-lg"></i><span class="text-lg font-medium">开始计时</span>';
                    timerDom.timerMessage.textContent = '';
                    timerDom.timerMinutes.disabled = false;
                    timerDom.timerSeconds.disabled = false;
                    timerDom.timerInput.disabled = false;
                }
            }
            
            timerDom.workoutTab.classList.add('text-slate-500');
            timerDom.workoutTab.classList.remove('text-primary', 'border-b-2', 'border-primary');
            timerDom.timerTab.classList.add('text-slate-500');
            timerDom.timerTab.classList.remove('text-primary', 'border-b-2', 'border-primary');
            timerDom.planTab.classList.add('text-primary', 'border-b-2', 'border-primary');
            timerDom.planTab.classList.remove('text-slate-500');
            document.title = '每日训练计划';
        }

        
        appState.clickSound.currentTime = 0;
        appState.clickSound.play();
    };

    // 事件监听
    timerDom.workoutTab.addEventListener('click', () => switchMode('workout'));
    timerDom.timerTab.addEventListener('click', () => switchMode('timer'));
    timerDom.planTab.addEventListener('click', () => switchMode('plan'));
    timerDom.timerStartBtn.addEventListener('click', startTimer);
    timerDom.timerResetBtn.addEventListener('click', resetTimer);
    
    timerDom.timerMinutes.addEventListener('change', () => {
        if (!timerState.isRunning) {
            let minutes = parseInt(timerDom.timerMinutes.value) || 0;
            minutes = Math.max(0, minutes);
            timerDom.timerMinutes.value = minutes;
            timerState.minutes = minutes;
            timerDom.timerInput.value = minutes * 60 + timerState.seconds;
            updateTimerDisplay();
        }
    });
    
    timerDom.timerSeconds.addEventListener('change', () => {
        if (!timerState.isRunning) {
            let seconds = parseInt(timerDom.timerSeconds.value) || 0;
            seconds = Math.max(0, Math.min(59, seconds));
            timerDom.timerSeconds.value = seconds;
            timerState.seconds = seconds;
            timerDom.timerInput.value = timerState.minutes * 60 + seconds;
            updateTimerDisplay();
        }
    });

    // 处理秒输入并转换为分钟和秒
    function handleTimerInput() {
        if (!timerState.isRunning && timerDom) {
            let totalSeconds = parseInt(timerDom.timerInput.value) || 0;
            totalSeconds = Math.max(0, totalSeconds);
            
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            
            timerState.minutes = minutes;
            timerState.seconds = seconds;
            
            timerDom.timerMinutes.value = minutes;
            timerDom.timerSeconds.value = seconds;
            
            updateTimerDisplay();
        }
    }
    
    timerDom.timerInput.addEventListener('change', handleTimerInput);
    timerDom.timerInput.addEventListener('input', handleTimerInput);

    // 初始化独立计时器显示
    updateTimerDisplay();
    // 渲染训练计划
    renderTrainingPlans();
    // 初始化锻炼模式头部显示
    updateWorkoutModeHeader();
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!timerDom || timerDom.workoutMode.classList.contains('block')) {
            dom.startBtn.click();
        }
    }
    if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        if (timerDom && timerDom.timerMode.classList.contains('block')) {
            resetTimer();
        } else {
            dom.resetBtn.click();
        }
    }
});
