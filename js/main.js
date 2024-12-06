class ImageCompressor {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.originalFile = null;
        this.compressedBlob = null;
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.originalImage = document.getElementById('originalImage');
        this.compressedImage = document.getElementById('compressedImage');
        this.qualitySlider = document.getElementById('qualitySlider');
        this.qualityValue = document.getElementById('qualityValue');
        this.originalSize = document.getElementById('originalSize');
        this.originalDimensions = document.getElementById('originalDimensions');
        this.compressedSize = document.getElementById('compressedSize');
        this.compressionRatio = document.getElementById('compressionRatio');
        this.downloadButton = document.getElementById('downloadButton');
    }

    bindEvents() {
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', () => this.handleDragLeave());
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.qualitySlider.addEventListener('input', () => this.handleQualityChange());
        this.downloadButton.addEventListener('click', () => this.downloadImage());
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.add('drag-over');
    }

    handleDragLeave() {
        this.uploadArea.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        if (this.isValidImageFile(file)) {
            this.processFile(file);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (this.isValidImageFile(file)) {
            this.processFile(file);
        }
    }

    isValidImageFile(file) {
        return file && ['image/jpeg', 'image/png'].includes(file.type);
    }

    async processFile(file) {
        // 1. 先显示容器
        const comparisonContainer = document.querySelector('.comparison-container');
        comparisonContainer.style.display = 'grid';  // 直接设置display为grid
        
        this.originalFile = file;
        this.originalSize.textContent = this.formatFileSize(file.size);
        
        // 2. 创建并读取文件
        const reader = new FileReader();
        reader.onload = (e) => {
            // 3. 设置原始图片
            this.originalImage.src = e.target.result;
            this.originalImage.onload = () => {
                // 4. 设置图片尺寸信息
                this.originalDimensions.textContent = 
                    `${this.originalImage.naturalWidth} × ${this.originalImage.naturalHeight}`;
                // 5. 压缩图片
                this.compressImage();
            };
        };
        reader.readAsDataURL(file);
    }

    async compressImage() {
        const quality = this.qualitySlider.value / 100;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = this.originalImage.naturalWidth;
        canvas.height = this.originalImage.naturalHeight;
        ctx.drawImage(this.originalImage, 0, 0);

        const compressedDataUrl = canvas.toDataURL(this.originalFile.type, quality);
        this.compressedImage.src = compressedDataUrl;

        // 转换为Blob以获取压缩后的文件大小
        this.compressedBlob = await fetch(compressedDataUrl).then(res => res.blob());
        this.compressedSize.textContent = this.formatFileSize(this.compressedBlob.size);
        
        const ratio = ((1 - this.compressedBlob.size / this.originalFile.size) * 100).toFixed(1);
        this.compressionRatio.textContent = `${ratio}%`;
        
        this.downloadButton.disabled = false;
    }

    handleQualityChange() {
        this.qualityValue.textContent = `${this.qualitySlider.value}%`;
        if (this.originalFile) {
            this.compressImage();
        }
    }

    downloadImage() {
        if (!this.compressedBlob) return;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(this.compressedBlob);
        link.download = `compressed_${this.originalFile.name}`;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ImageCompressor();
}); 