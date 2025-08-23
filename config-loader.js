/**
 * 配置加载器 - 动态加载配置文件并更新页面内容
 * 支持便利更改徽标、图片和联系信息
 */

class ConfigLoader {
    constructor() {
        this.config = null;
        this.init();
    }

    /**
     * 初始化配置加载器
     */
    async init() {
        try {
            await this.loadConfig();
            this.applyConfig();
            this.setupImageUpload();
            console.log('配置加载完成');
        } catch (error) {
            console.error('配置加载失败:', error);
            this.useDefaultConfig();
        }
    }

    /**
     * 加载配置文件
     */
    async loadConfig() {
        // 首先从config.json加载基础配置
        const response = await fetch('config.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.config = await response.json();
        
        // 然后从localStorage加载用户自定义的配置（如上传的图片）
        const savedConfig = localStorage.getItem('hospital_config');
        if (savedConfig) {
            try {
                const userConfig = JSON.parse(savedConfig);
                // 合并配置，用户配置优先
                this.config = this.mergeConfig(this.config, userConfig);
                console.log('已加载用户自定义配置');
            } catch (error) {
                console.error('解析用户配置失败:', error);
            }
        }
    }

    /**
     * 合并配置对象
     */
    mergeConfig(baseConfig, userConfig) {
        const merged = JSON.parse(JSON.stringify(baseConfig)); // 深拷贝基础配置
        
        // 递归合并配置
        function deepMerge(target, source) {
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    deepMerge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        
        deepMerge(merged, userConfig);
        return merged;
    }

    /**
     * 应用配置到页面
     */
    applyConfig() {
        if (!this.config) return;

        // 更新医院徽标
        const logoImg = document.getElementById('hospital-logo');
        if (logoImg && this.config.hospital.logo) {
            // 如果是base64格式，直接使用
            if (this.config.hospital.logo.startsWith('data:image/')) {
                logoImg.src = this.config.hospital.logo;
            } else {
                logoImg.src = this.getImagePath(this.config.hospital.logo);
            }
            logoImg.alt = this.config.hospital.name;
        }

        // 更新医患沟通图片
        const doctorPatientImg = document.getElementById('doctor-patient-img');
        if (doctorPatientImg && this.config.images.doctor_patient_communication) {
            // 如果是base64格式，直接使用
            if (this.config.images.doctor_patient_communication.startsWith('data:image/')) {
                doctorPatientImg.src = this.config.images.doctor_patient_communication;
            } else {
                this.loadDoctorPatientImage(doctorPatientImg);
            }
        }

        // 更新医生二维码
        const doctorQrImg = document.getElementById('doctor-qr');
        if (doctorQrImg && this.config.qr_codes && this.config.qr_codes.doctor_qr) {
            // 如果是base64格式，直接使用
            if (this.config.qr_codes.doctor_qr.startsWith('data:image/')) {
                doctorQrImg.src = this.config.qr_codes.doctor_qr;
            } else {
                doctorQrImg.src = this.getImagePath(this.config.qr_codes.doctor_qr);
            }
        }

        // 更新联系信息
        this.updateContactInfo();

        // 更新小程序链接
        this.updateMiniprogramLink();

        // 更新主题样式
        this.updateTheme();
    }

    /**
     * 智能加载医患沟通图片
     */
    async loadDoctorPatientImage(imgElement) {
        const basePath = this.config.images.doctor_patient_communication;
        
        // 如果是完整URL或base64，直接使用
        if (basePath.startsWith('http') || basePath.startsWith('data:')) {
            imgElement.src = basePath;
            return;
        }
        
        // 检查用户上传的图片文件（按优先级：jpg > png > svg）
        const formats = ['.jpg', '.jpeg', '.png', '.webp'];
        
        for (const format of formats) {
            const filePath = basePath + format;
            try {
                // 尝试读取文件内容
                const response = await fetch(filePath);
                if (response.ok) {
                    const text = await response.text();
                    // 检查是否是base64格式的图片数据
                    if (text.trim().startsWith('data:image/')) {
                        imgElement.src = text.trim();
                        return;
                    } else {
                        // 普通图片文件
                        imgElement.src = filePath;
                        return;
                    }
                }
            } catch (error) {
                // 继续尝试下一个格式
                console.log(`Failed to load ${filePath}:`, error);
                continue;
            }
        }
        
        // 如果没有找到用户上传的图片，使用默认SVG
        const svgPath = basePath + '.svg';
        try {
            const response = await fetch(svgPath);
            if (response.ok) {
                imgElement.src = svgPath;
                return;
            }
        } catch (error) {
            // 使用备用图片
            imgElement.src = this.config.images.backup_doctor_patient;
        }
    }

    /**
     * 更新联系信息
     */
    updateContactInfo() {
        const mainPhone = document.getElementById('main-phone');
        const deptPhone = document.getElementById('dept-phone');
        
        if (mainPhone && this.config.contact.phone) {
            mainPhone.href = `tel:${this.config.contact.phone}`;
            mainPhone.textContent = `📱 ${this.config.contact.phone}`;
        }

        if (deptPhone && this.config.contact.department_phone) {
            deptPhone.href = `tel:${this.config.contact.department_phone}`;
            deptPhone.textContent = `📱 ${this.config.contact.department_phone}`;
        }

        // 更新联系信息
        if (this.config.contact) {
            const departmentName = document.getElementById('department-name');
            const departmentPhone = document.getElementById('department-phone');
            const hospitalAddress = document.getElementById('hospital-address');
            
            if (departmentName && this.config.contact.department) {
                departmentName.textContent = this.config.contact.department;
            }
            if (departmentPhone && this.config.contact.phone) {
                departmentPhone.textContent = this.config.contact.phone;
            }
            if (hospitalAddress && this.config.contact.address) {
                hospitalAddress.textContent = this.config.contact.address;
            }
            
            // 更新官网链接
            if (this.config.contact.website) {
                const websiteElement = document.getElementById('website');
                if (websiteElement) {
                    websiteElement.href = this.config.contact.website;
                    websiteElement.textContent = '呼吸与危重症病院';
                }
            }
        }

        // 更新科普编辑信息
        if (this.config.editor) {
            const editorName = document.getElementById('editor-name');
            const editorDepartment = document.getElementById('editor-department');
            
            if (editorName && this.config.editor.name) {
                editorName.textContent = this.config.editor.name;
            }
            if (editorDepartment && this.config.editor.department) {
                editorDepartment.textContent = this.config.editor.department;
            }
        }

        // 更新二维码
        if (this.config.qr_codes) {
            const doctorQr = document.getElementById('doctor-qr');
            
            if (doctorQr && this.config.qr_codes.doctor_qr) {
                // 如果是base64格式，直接使用
                if (this.config.qr_codes.doctor_qr.startsWith('data:image/')) {
                    doctorQr.src = this.config.qr_codes.doctor_qr;
                } else {
                    doctorQr.src = this.getImagePath(this.config.qr_codes.doctor_qr);
                    if (this.config.qr_codes.backup_doctor_qr) {
                        doctorQr.onerror = () => {
                            doctorQr.src = this.config.qr_codes.backup_doctor_qr;
                        };
                    }
                }
            }
        }

        // 应用字体设置
        if (this.config.typography) {
            const root = document.documentElement;
            if (this.config.typography.font_family) {
                root.style.setProperty('--font-family', this.config.typography.font_family);
                document.body.style.fontFamily = this.config.typography.font_family;
            }
            if (this.config.typography.font_size) {
                root.style.setProperty('--font-size', this.config.typography.font_size);
                document.body.style.fontSize = this.config.typography.font_size;
            }
            if (this.config.typography.line_height) {
                root.style.setProperty('--line-height', this.config.typography.line_height);
                document.body.style.lineHeight = this.config.typography.line_height;
            }
        }
    }

    /**
     * 更新小程序链接
     */
    updateMiniprogramLink() {
        const miniprogramLink = document.getElementById('miniprogram-link');
        if (miniprogramLink && this.config.hospital.miniprogram) {
            miniprogramLink.href = this.config.hospital.miniprogram;
            
            // 添加点击事件处理
            miniprogramLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openMiniprogram(this.config.hospital.miniprogram);
            });
        }
    }

    /**
     * 打开小程序
     */
    openMiniprogram(miniprogramUrl) {
        // 检测微信环境
        const isWeChat = /micromessenger/i.test(navigator.userAgent);
        
        if (isWeChat) {
            // 在微信中直接跳转
            window.location.href = miniprogramUrl;
        } else {
            // 非微信环境提示
            alert('请在微信中打开此页面以使用小程序功能');
        }
    }

    /**
     * 更新主题样式
     */
    updateTheme() {
        if (!this.config.theme) return;

        const root = document.documentElement;
        root.style.setProperty('--primary-color', this.config.theme.primary_color);
        root.style.setProperty('--secondary-color', this.config.theme.secondary_color);
        root.style.setProperty('--accent-color', this.config.theme.accent_color);
        
        // 更新字体
        if (this.config.theme.font_family) {
            document.body.style.fontFamily = this.config.theme.font_family;
        }
    }

    /**
     * 设置图片上传功能
     */
    setupImageUpload() {
        // 创建隐藏的文件输入元素
        this.createFileInputs();
        
        // 为图片添加双击事件以便更换
        this.addImageClickHandlers();
    }

    /**
     * 创建文件输入元素
     */
    createFileInputs() {
        // 医院徽标文件输入
        const logoInput = document.createElement('input');
        logoInput.type = 'file';
        logoInput.id = 'logo-file-input';
        logoInput.accept = 'image/*';
        logoInput.style.display = 'none';
        logoInput.addEventListener('change', (e) => this.handleImageUpload(e, 'logo'));
        document.body.appendChild(logoInput);

        // 医患沟通图片文件输入
        const commInput = document.createElement('input');
        commInput.type = 'file';
        commInput.id = 'comm-file-input';
        commInput.accept = 'image/*';
        commInput.style.display = 'none';
        commInput.addEventListener('change', (e) => this.handleImageUpload(e, 'communication'));
        document.body.appendChild(commInput);



        // 医生二维码文件输入
        const doctorQrInput = document.createElement('input');
        doctorQrInput.type = 'file';
        doctorQrInput.id = 'doctor-qr-file-input';
        doctorQrInput.accept = 'image/*';
        doctorQrInput.style.display = 'none';
        doctorQrInput.addEventListener('change', (e) => this.handleImageUpload(e, 'doctor-qr'));
        document.body.appendChild(doctorQrInput);
    }

    /**
     * 添加图片点击处理器
     */
    addImageClickHandlers() {
        const logoImg = document.getElementById('hospital-logo');
        const commImg = document.getElementById('doctor-patient-img');
        const doctorQr = document.getElementById('doctor-qr');

        if (logoImg) {
            logoImg.addEventListener('dblclick', () => {
                document.getElementById('logo-file-input').click();
            });
            logoImg.style.cursor = 'pointer';
            logoImg.title = '双击更换医院徽标';
        }

        if (commImg) {
            commImg.addEventListener('dblclick', () => {
                document.getElementById('comm-file-input').click();
            });
            commImg.style.cursor = 'pointer';
            commImg.title = '双击更换医患沟通图片';
        }



        if (doctorQr) {
            doctorQr.addEventListener('dblclick', () => {
                document.getElementById('doctor-qr-file-input').click();
            });
            doctorQr.style.cursor = 'pointer';
            doctorQr.title = '双击更换医生二维码';
        }
    }

    /**
     * 处理图片上传
     */
    handleImageUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        // 验证文件类型 - 支持多种图片格式
        const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
        if (!file.type.startsWith('image/') || !supportedTypes.includes(file.type)) {
            alert('请选择支持的图片格式：JPG、JPEG、PNG、WebP、SVG或GIF');
            return;
        }

        // 验证文件大小 (最大5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('图片文件不能超过5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            
            if (type === 'logo') {
                const logoImg = document.getElementById('hospital-logo');
                if (logoImg) {
                    logoImg.src = imageUrl;
                    this.updateConfig('hospital.logo', imageUrl);
                }
            } else if (type === 'communication') {
                const commImg = document.getElementById('doctor-patient-img');
                if (commImg) {
                    commImg.src = imageUrl;
                    this.updateConfig('images.doctor_patient_communication', imageUrl);
                }
            } else if (type === 'doctor-qr') {
                const doctorQrImg = document.getElementById('doctor-qr');
                if (doctorQrImg) {
                    doctorQrImg.src = imageUrl;
                    this.updateConfig('qr_codes.doctor_qr', imageUrl);
                }
            }
        };
        
        reader.readAsDataURL(file);
    }

    /**
     * 更新配置
     */
    updateConfig(path, value) {
        const keys = path.split('.');
        let current = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        
        // 保存到本地存储
        localStorage.setItem('hospital_config', JSON.stringify(this.config));
        console.log('配置已更新:', path, value);
    }

    /**
     * 获取图片路径，支持JPG、PNG、WebP和SVG格式自动检测
     */
    getImagePath(imagePath) {
        // 如果是完整URL或base64，直接返回
        if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
            return imagePath;
        }
        
        // 如果已经有扩展名，直接返回
        if (imagePath.includes('.')) {
            return imagePath;
        }
        
        // 获取支持的格式列表
        const formats = this.config.images?.supported_formats || ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
        const defaultFormat = this.config.images?.default_format || '.svg';
        
        // 优先尝试默认格式
        if (defaultFormat && formats.includes(defaultFormat)) {
            return imagePath + defaultFormat;
        }
        
        // 如果默认格式不可用，尝试其他格式
        for (const format of formats) {
            const testPath = imagePath + format;
            // 可以在这里添加文件存在性检测
            return testPath;
        }
        
        return imagePath;
    }

    /**
     * 检测图片文件是否存在（异步方法）
     */
    async checkImageExists(imagePath) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = imagePath;
        });
    }

    /**
     * 智能获取图片路径，自动检测可用格式
     */
    async getSmartImagePath(imagePath) {
        // 如果是完整URL或base64，直接返回
        if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
            return imagePath;
        }
        
        // 如果已经有扩展名，检测是否存在
        if (imagePath.includes('.')) {
            const exists = await this.checkImageExists(imagePath);
            return exists ? imagePath : null;
        }
        
        // 获取支持的格式列表
        const formats = this.config.images?.supported_formats || ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
        
        // 依次检测每种格式
        for (const format of formats) {
            const testPath = imagePath + format;
            const exists = await this.checkImageExists(testPath);
            if (exists) {
                return testPath;
            }
        }
        
        // 如果都不存在，返回默认格式
        const defaultFormat = this.config.images?.default_format || '.svg';
        return imagePath + defaultFormat;
    }

    /**
     * 使用默认配置
     */
    useDefaultConfig() {
        console.log('使用默认配置');
        // 可以在这里设置默认值
    }

    /**
     * 导出配置
     */
    exportConfig() {
        const dataStr = JSON.stringify(this.config, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'hospital_config.json';
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

// 页面加载完成后初始化配置加载器
document.addEventListener('DOMContentLoaded', () => {
    const configLoader = new ConfigLoader();
    // 将configLoader实例设为全局变量，供其他脚本使用
    window.configLoader = configLoader;
    
    configLoader.init().then(() => {
        console.log('页面配置初始化完成');
    }).catch(error => {
        console.error('页面配置初始化失败:', error);
    });
    
    // 添加管理员快捷键 (Ctrl+Alt+C 导出配置)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.key === 'c') {
            window.configLoader.exportConfig();
        }
    });
});

// 导出配置加载器类
window.ConfigLoader = ConfigLoader;