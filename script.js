/**
 * 咸阳市第一人民医院呼吸科H5页面交互脚本
 * 提供基础交互功能和微信环境优化
 */

// 字体映射配置
const fontMap = {
    'hanyi': "'汉仪方隶简', 'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', sans-serif",
    'yahei': "'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', sans-serif",
    'pingfang': "'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif",
    'songti': "'SimSun', '宋体', serif",
    'kaiti': "'KaiTi', '楷体', serif",
    'heiti': "'SimHei', '黑体', sans-serif"
};

/**
 * 切换页面字体
 * @param {string} fontKey - 字体键值
 */
function switchFont(fontKey) {
    const fontFamily = fontMap[fontKey];
    if (fontFamily) {
        document.body.style.fontFamily = fontFamily;
        // 保存用户选择到本地存储
        localStorage.setItem('selectedFont', fontKey);
        console.log(`字体已切换为: ${fontKey}`);
    }
}

/**
 * 加载用户保存的字体偏好
 */
function loadFontPreference() {
    const savedFont = localStorage.getItem('selectedFont');
    if (savedFont && fontMap[savedFont]) {
        switchFont(savedFont);
        // 更新选择器的值
        const fontSelector = document.getElementById('font-selector');
        if (fontSelector) {
            fontSelector.value = savedFont;
        }
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('咸阳市第一人民医院呼吸科H5页面已加载');
    
    // 加载用户字体偏好
    loadFontPreference();
    
    // 绑定字体选择器事件
    const fontSelector = document.getElementById('font-selector');
    if (fontSelector) {
        fontSelector.addEventListener('change', function(e) {
            switchFont(e.target.value);
        });
    }
    
    // 初始化页面功能
    initPageFeatures();
    
    // 微信环境检测和优化
    initWeChatOptimization();
    
    // 添加页面交互效果
    initInteractiveEffects();
    
    // 添加统计和分析
    initAnalytics();
});

// 导出函数供全局使用
window.switchFont = switchFont;
window.loadFontPreference = loadFontPreference;

/**
 * 初始化页面基础功能
 */
function initPageFeatures() {
    // 电话号码点击统计
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const phoneNumber = this.getAttribute('href').replace('tel:', '');
            console.log('用户点击电话号码:', phoneNumber);
            
            // 可以在这里添加统计代码
            trackEvent('phone_click', {
                phone_number: phoneNumber,
                timestamp: new Date().toISOString()
            });
        });
    });
    
    // 外部链接点击统计
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    externalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const url = this.getAttribute('href');
            console.log('用户点击外部链接:', url);
            
            trackEvent('external_link_click', {
                url: url,
                timestamp: new Date().toISOString()
            });
        });
    });
}

/**
 * 微信环境检测和优化
 */
function initWeChatOptimization() {
    // 检测是否在微信环境中
    const isWeChat = /micromessenger/i.test(navigator.userAgent);
    
    if (isWeChat) {
        console.log('检测到微信环境');
        document.body.classList.add('wechat-env');
        
        // 微信分享配置（需要微信JS-SDK）
        if (typeof wx !== 'undefined') {
            configWeChatShare();
        }
        
        // 防止微信内置浏览器的一些问题
        preventWeChatIssues();
    }
    
    // 移动端优化
    if (isMobile()) {
        document.body.classList.add('mobile-env');
        initMobileOptimization();
    }
}

/**
 * 配置微信分享（需要后端支持获取签名）
 */
function configWeChatShare() {
    // 这里需要从后端获取微信分享的配置信息
    // 由于是静态页面，这里只是示例代码
    const shareConfig = {
        title: '咳咳咳，是小感冒，还是肺出了问题？ - 咸阳市第一人民医院呼吸科',
        desc: '呼吸病院医生带您认识呼吸道疾病，科学就医，关爱健康',
        link: window.location.href,
        imgUrl: window.location.origin + '/hospital-logo.png'
    };
    
    console.log('微信分享配置:', shareConfig);
}

/**
 * 防止微信内置浏览器的一些问题
 */
function preventWeChatIssues() {
    // 防止页面被缓存
    if (window.history && window.history.pushState) {
        window.history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', function() {
            window.history.pushState(null, null, window.location.href);
        });
    }
    
    // 防止微信浏览器的字体缩放
    document.addEventListener('touchstart', function() {}, {passive: true});
}

/**
 * 检测是否为移动设备
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 移动端优化
 */
function initMobileOptimization() {
    // 防止iOS Safari的回弹效果
    document.addEventListener('touchmove', function(e) {
        if (e.target.closest('.scrollable')) {
            return;
        }
        e.preventDefault();
    }, {passive: false});
    
    // 优化点击延迟
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
}

/**
 * 添加页面交互效果
 */
function initInteractiveEffects() {
    // 添加滚动动画效果
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // 观察所有section元素
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('animate-ready');
        observer.observe(section);
    });
    
    // 添加点击反馈效果
    const clickableElements = document.querySelectorAll('a, button, .clickable');
    clickableElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.classList.add('touching');
        });
        
        element.addEventListener('touchend', function() {
            this.classList.remove('touching');
        });
        
        element.addEventListener('touchcancel', function() {
            this.classList.remove('touching');
        });
    });
}

/**
 * 事件统计函数
 */
function trackEvent(eventName, eventData) {
    // 这里可以集成第三方统计工具，如百度统计、Google Analytics等
    console.log('统计事件:', eventName, eventData);
    
    // 示例：发送到统计服务
    // if (typeof _hmt !== 'undefined') {
    //     _hmt.push(['_trackEvent', 'interaction', eventName, JSON.stringify(eventData)]);
    // }
}

/**
 * 初始化页面分析
 */
function initAnalytics() {
    // 记录页面访问
    trackEvent('page_view', {
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        screen_size: screen.width + 'x' + screen.height,
        viewport_size: window.innerWidth + 'x' + window.innerHeight
    });
    
    // 记录页面停留时间
    let startTime = Date.now();
    
    window.addEventListener('beforeunload', function() {
        const stayTime = Date.now() - startTime;
        trackEvent('page_stay_time', {
            stay_time_ms: stayTime,
            stay_time_seconds: Math.round(stayTime / 1000)
        });
    });
    
    // 记录滚动深度
    let maxScrollDepth = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollDepth = Math.round((scrollTop / documentHeight) * 100);
        
        if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;
        }
    });
    
    window.addEventListener('beforeunload', function() {
        trackEvent('max_scroll_depth', {
            depth_percentage: maxScrollDepth
        });
    });
}

/**
 * 错误处理
 */
window.addEventListener('error', function(e) {
    console.error('页面错误:', e.error);
    trackEvent('javascript_error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error ? e.error.stack : null
    });
});

// 添加CSS动画类
const style = document.createElement('style');
style.textContent = `
    .animate-ready {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .touching {
        opacity: 0.7;
        transform: scale(0.98);
        transition: opacity 0.1s ease, transform 0.1s ease;
    }
    
    @media (prefers-reduced-motion: reduce) {
        .animate-ready,
        .animate-in,
        .touching {
            transition: none;
            transform: none;
        }
    }
`;
document.head.appendChild(style);

/**
 * 图片上传功能
 * @param {string} imageId - 图片元素的ID
 */
function uploadImage(imageId) {
    // 创建文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    // 添加文件选择事件监听器
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            // 检查文件类型
            if (!file.type.startsWith('image/')) {
                alert('请选择图片文件！');
                return;
            }
            
            // 检查文件大小（限制为5MB）
            if (file.size > 5 * 1024 * 1024) {
                alert('图片文件大小不能超过5MB！');
                return;
            }
            
            // 创建FileReader来读取文件
            const reader = new FileReader();
            reader.onload = function(e) {
                // 更新图片源
                const imageElement = document.getElementById(imageId);
                if (imageElement) {
                    imageElement.src = e.target.result;
                    console.log('图片已更新:', imageId);
                    
                    // 保存到配置中
                    if (window.configLoader) {
                        if (imageId === 'doctor-qr') {
                            window.configLoader.updateConfig('qr_codes.doctor_qr', e.target.result);
                        } else if (imageId === 'doctor-patient-img') {
                            window.configLoader.updateConfig('images.doctor_patient_communication', e.target.result);
                        } else if (imageId === 'hospital-logo') {
                            window.configLoader.updateConfig('hospital.logo', e.target.result);
                        }
                    }
                    
                    // 记录上传事件
                    trackEvent('image_upload', {
                        image_id: imageId,
                        file_name: file.name,
                        file_size: file.size,
                        timestamp: new Date().toISOString()
                    });
                }
            };
            
            // 读取文件为Data URL
            reader.readAsDataURL(file);
        }
    });
    
    // 触发文件选择对话框
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}