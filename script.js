class DressUpHamster {
    constructor() {
        this.currentMood = 'custom';
        this.currentOutfit = {
            tops: [],
            bottoms: [],
            accessories: []
        };
        this.savedOutfits = JSON.parse(localStorage.getItem('savedOutfits') || '[]');
        this.draggedItem = null;
        this.dragOffset = { x: 0, y: 0 };
        this.selectedAccessory = null;
        this.isSelectionMode = false;
        
        // Define all available image assets
        this.imageAssets = [
            { name: 'Accessory 17', src: 'public/assets/___17_-removebg-preview.png', emoji: '🎩' },
            { name: 'Accessory 16', src: 'public/assets/___16_-removebg-preview.png', emoji: '👑' },
            { name: 'Accessory 18', src: 'public/assets/___18_-removebg-preview.png', emoji: '💎' },
            { name: 'Accessory 19', src: 'public/assets/___19_-removebg-preview.png', emoji: '🌟' },
            { name: 'Accessory 20', src: 'public/assets/___20_-removebg-preview.png', emoji: '✨' },
            { name: 'Accessory 15', src: 'public/assets/___15_-removebg-preview.png', emoji: '🎪' },
            { name: 'Pink Heart', src: 'public/assets/pink pixel heart.jpeg', emoji: '💖' },
            { name: 'Bricks', src: 'public/assets/bricks.png', emoji: '🧱' }
        ];
        
        this.clothingData = {
            casual: {
                tops: ['👕', '🎽', '🧥', '👚', '🦺'],
                bottoms: ['👖', '🩳', '👗', '👘', '🩱'],
                accessories: ['👒', '🧢', '🎩', '👓', '👜']
            },
            fancy: {
                tops: ['👔', '🎩', '👑', '💎', '🌟'],
                bottoms: ['👖', '👗', '👘', '🩱', '💃'],
                accessories: ['👑', '💍', '💎', '🌟', '✨']
            },
            silly: {
                tops: ['🤡', '🎭', '🎪', '🎨', '🌈'],
                bottoms: ['🩳', '👗', '👘', '🩱', '🎪'],
                accessories: ['🤡', '🎭', '🎪', '🎨', '🌈']
            },
            seasonal: {
                tops: ['🧥', '🎄', '🌸', '☀️', '🍂'],
                bottoms: ['👖', '👗', '👘', '🩱', '🎄'],
                accessories: ['🧤', '🎄', '🌸', '☀️', '🍂']
            },
            weapons: {
                tops: ['👕', '🎽', '🧥', '👚', '🦺'],
                bottoms: ['👖', '🩳', '👗', '👘', '🩱'],
                accessories: ['🔫', '⚔️', '🛡️', '🗡️', '🏹']
            },
            custom: {
                tops: ['👕', '🎽', '🧥', '👚', '🦺'],
                bottoms: ['👖', '🩳', '👗', '👘', '🩱'],
                accessories: ['🔫', '💣', '🔥', '👨‍⚕️', '🎩']
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.populateCloset();
        this.loadSavedOutfits();
        this.setupDragAndDrop();
        this.setupSelectionMode();
    }
    
    setupEventListeners() {
        // Mood tabs
        document.querySelectorAll('.mood-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchMood(e.target.dataset.mood);
            });
        });
    }
    
    setupSelectionMode() {
        const hamsterArea = document.getElementById('hamster-area');
        
        hamsterArea.addEventListener('click', (e) => {
            if (this.selectedAccessory && this.isSelectionMode) {
                this.placeAccessory(e);
            }
        });
        
        // Add selection mode toggle
        const selectionBtn = document.createElement('button');
        selectionBtn.className = 'btn selection-btn';
        selectionBtn.textContent = '🎯 Selection Mode';
        selectionBtn.addEventListener('click', () => {
            this.toggleSelectionMode();
        });
        
        document.querySelector('.header-buttons').appendChild(selectionBtn);
    }
    
    toggleSelectionMode() {
        this.isSelectionMode = !this.isSelectionMode;
        const btn = document.querySelector('.selection-btn');
        
        if (this.isSelectionMode) {
            btn.textContent = '🎯 Selection Mode (ON)';
            btn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
            this.showNotification('Selection mode ON! Click accessories to select, then click on hamster to place.');
        } else {
            btn.textContent = '🎯 Selection Mode';
            btn.style.background = 'linear-gradient(45deg, #ff6b9d, #ff8fab)';
            this.selectedAccessory = null;
            this.showNotification('Selection mode OFF! Back to drag & drop.');
        }
    }
    
    placeAccessory(e) {
        const hamsterArea = document.getElementById('hamster-area');
        const rect = hamsterArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const outfitItem = document.createElement('div');
        outfitItem.className = 'outfit-item new';
        outfitItem.style.left = `${x}px`;
        outfitItem.style.top = `${y}px`;
        outfitItem.style.transform = 'translate(-50%, -50%)';
        
        if (this.selectedAccessory.isImage) {
            const img = document.createElement('img');
            img.src = this.selectedAccessory.src;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            outfitItem.appendChild(img);
            outfitItem.dataset.isImage = 'true';
        } else {
            outfitItem.textContent = this.selectedAccessory.emoji;
        }
        
        outfitItem.dataset.type = 'accessory';
        outfitItem.dataset.emoji = this.selectedAccessory.emoji;
        
        document.getElementById('outfit-layer').appendChild(outfitItem);
        
        // Add drag functionality to the placed item
        setTimeout(() => {
            outfitItem.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.startDragFromPlaced(e, outfitItem);
            });
        }, 100);
        
        // Clear selection
        this.selectedAccessory = null;
        this.isSelectionMode = false;
        
        // Update button
        const btn = document.querySelector('.selection-btn');
        btn.textContent = '🎯 Selection Mode';
        btn.style.background = 'linear-gradient(45deg, #ff6b9d, #ff8fab)';
        
        this.showNotification('Accessory placed!');
    }
    
    switchMood(mood) {
        this.currentMood = mood;
        
        // Update active tab
        document.querySelectorAll('.mood-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mood === mood);
        });
        
        // Repopulate closet
        this.populateCloset();
    }
    
    populateCloset() {
        // Only populate accessories with custom assets
        const accessoriesGrid = document.getElementById('accessories-grid');
        accessoriesGrid.innerHTML = '';
        
        // Show all image assets
        this.imageAssets.forEach((asset, index) => {
            const clothingItem = this.createImageClothingItem(asset, 'accessory', index);
            accessoriesGrid.appendChild(clothingItem);
        });
    }
    
    createClothingItem(emoji, type, index) {
        const item = document.createElement('div');
        item.className = 'clothing-item';
        item.textContent = emoji;
        item.dataset.type = type;
        item.dataset.index = index;
        item.dataset.emoji = emoji;
        
        item.addEventListener('mousedown', (e) => {
            if (this.isSelectionMode) {
                this.selectAccessory({ emoji: emoji, isImage: false });
            } else {
                this.startDrag(e, item);
            }
        });
        
        return item;
    }
    
    createImageClothingItem(asset, type, index) {
        const item = document.createElement('div');
        item.className = 'clothing-item';
        
        const img = document.createElement('img');
        img.src = asset.src;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        item.appendChild(img);
        
        item.dataset.type = type;
        item.dataset.index = index;
        item.dataset.emoji = asset.emoji;
        item.dataset.isImage = 'true';
        item.dataset.assetName = asset.name;
        
        item.addEventListener('mousedown', (e) => {
            if (this.isSelectionMode) {
                this.selectAccessory({ 
                    emoji: asset.emoji, 
                    isImage: true, 
                    src: asset.src,
                    name: asset.name 
                });
            } else {
                this.startDrag(e, item);
            }
        });
        
        return item;
    }
    
    selectAccessory(accessory) {
        this.selectedAccessory = accessory;
        this.showNotification(`Selected: ${accessory.name || accessory.emoji}`);
    }
    
    setupDragAndDrop() {
        const outfitLayer = document.getElementById('outfit-layer');
        const closetPanel = document.querySelector('.closet-panel');
        
        outfitLayer.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        outfitLayer.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleDrop(e);
        });
        
        // Closet drop functionality is handled in the mouse drag system
        
        // Remove outfit items on right click
        outfitLayer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('outfit-item')) {
                e.target.remove();
            }
        });
        
        // Event delegation removed - using individual listeners instead
    }
    
    startDrag(e, item) {
        e.preventDefault();
        
        const outfitItem = document.createElement('div');
        outfitItem.className = 'outfit-item new';
        
        // Check if this is an image-based item
        if (item.dataset.isImage === 'true') {
            const img = document.createElement('img');
            img.src = item.querySelector('img').src;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            outfitItem.appendChild(img);
        } else {
            outfitItem.textContent = item.dataset.emoji;
        }
        
        outfitItem.dataset.type = item.dataset.type;
        outfitItem.dataset.emoji = item.dataset.emoji;
        outfitItem.style.left = '50%';
        outfitItem.style.top = '50%';
        outfitItem.style.transform = 'translate(-50%, -50%)';
        
        document.getElementById('outfit-layer').appendChild(outfitItem);
        
        // Start dragging immediately
        this.draggedItem = outfitItem;
        const rect = outfitItem.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        outfitItem.classList.add('dragging');
        
        document.addEventListener('mousemove', this.handleDrag);
        document.addEventListener('mouseup', this.stopDrag);
        
        // Add drag functionality to the item after it's placed
        setTimeout(() => {
            outfitItem.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.startDragFromPlaced(e, outfitItem);
            });
        }, 100);
    }
    
    startDragFromPlaced(e, outfitItem) {
        e.preventDefault();
        
        this.draggedItem = outfitItem;
        const rect = outfitItem.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        outfitItem.classList.add('dragging');
        
        // Add a visual indicator that item is being dragged
        outfitItem.style.opacity = '0.8';
        outfitItem.style.transform = 'scale(1.1) rotate(5deg)';
        
        document.addEventListener('mousemove', this.handleDrag);
        document.addEventListener('mouseup', this.stopDrag);
    }
    
    handleDrag = (e) => {
        if (this.draggedItem) {
            const outfitLayer = document.getElementById('outfit-layer');
            const rect = outfitLayer.getBoundingClientRect();
            
            const x = e.clientX - rect.left - this.dragOffset.x;
            const y = e.clientY - rect.top - this.dragOffset.y;
            
            // Keep item within bounds
            const maxX = rect.width - this.draggedItem.offsetWidth;
            const maxY = rect.height - this.draggedItem.offsetHeight;
            
            const clampedX = Math.max(0, Math.min(x, maxX));
            const clampedY = Math.max(0, Math.min(y, maxY));
            
            this.draggedItem.style.left = `${clampedX}px`;
            this.draggedItem.style.top = `${clampedY}px`;
            this.draggedItem.style.transform = 'scale(1.1) rotate(5deg)';
            
            // Check if mouse is over closet and provide visual feedback
            const closetPanel = document.querySelector('.closet-panel');
            const closetRect = closetPanel.getBoundingClientRect();
            
            if (e.clientX >= closetRect.left && e.clientX <= closetRect.right &&
                e.clientY >= closetRect.top && e.clientY <= closetRect.bottom) {
                // Mouse is over closet - highlight it
                closetPanel.style.backgroundColor = 'rgba(255, 107, 157, 0.1)';
                closetPanel.style.border = '2px dashed #ff6b9d';
                document.body.style.cursor = 'grabbing';
            } else {
                // Mouse not over closet - reset
                closetPanel.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                closetPanel.style.border = 'none';
                document.body.style.cursor = 'grabbing';
            }
        }
    }
    
    stopDrag = (e) => {
        if (this.draggedItem) {
            // Check if mouse is over closet panel when releasing
            const closetPanel = document.querySelector('.closet-panel');
            const closetRect = closetPanel.getBoundingClientRect();
            
            if (e && e.clientX >= closetRect.left && e.clientX <= closetRect.right &&
                e.clientY >= closetRect.top && e.clientY <= closetRect.bottom) {
                // Mouse is over closet - return the item
                this.draggedItem.remove();
                this.showNotification('Accessory returned to closet! 📦');
            } else {
                // Normal drop in hamster area
                this.draggedItem.classList.remove('dragging');
                this.draggedItem.style.opacity = '1';
                this.draggedItem.style.transform = 'none';
            }
            
            // Reset closet styling
            closetPanel.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            closetPanel.style.border = 'none';
            
            this.draggedItem = null;
        }
        
        // Reset cursor
        document.body.style.cursor = 'default';
        
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('mouseup', this.stopDrag);
    }
    
    handleDrop(e) {
        // This is handled by the drag and drop setup
    }
    
    handleClosetDrop(e) {
        if (this.draggedItem) {
            // Remove the item from the hamster area
            this.draggedItem.remove();
            this.showNotification('Accessory returned to closet!');
        }
    }
    
    generateRandomOutfit() {
        // Clear current outfit
        document.getElementById('outfit-layer').innerHTML = '';
        
        const moodData = this.clothingData[this.currentMood];
        
        // Randomly select items
        const randomTop = moodData.tops[Math.floor(Math.random() * moodData.tops.length)];
        const randomBottom = moodData.bottoms[Math.floor(Math.random() * moodData.bottoms.length)];
        const randomAccessory = moodData.accessories[Math.floor(Math.random() * moodData.accessories.length)];
        
        // Create outfit items at random positions
        const items = [
            { emoji: randomTop, type: 'top', x: 30, y: 20 },
            { emoji: randomBottom, type: 'bottom', x: 70, y: 60 },
            { emoji: randomAccessory, type: 'accessory', x: 50, y: 10 }
        ];
        
        items.forEach(item => {
            const outfitItem = document.createElement('div');
            outfitItem.className = 'outfit-item new';
            
            // Check if this is an image-based accessory
            if (item.emoji === '🔫' && this.currentMood === 'weapons') {
                const img = document.createElement('img');
                img.src = 'public/assets/gun.svg';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                outfitItem.appendChild(img);
                outfitItem.dataset.isImage = 'true';
            } else {
                outfitItem.textContent = item.emoji;
            }
            
            outfitItem.dataset.type = item.type;
            outfitItem.dataset.emoji = item.emoji;
            outfitItem.style.left = `${item.x}%`;
            outfitItem.style.top = `${item.y}%`;
            outfitItem.style.transform = 'translate(-50%, -50%)';
            
            document.getElementById('outfit-layer').appendChild(outfitItem);
        });
    }
    
    saveOutfit() {
        const outfitLayer = document.getElementById('outfit-layer');
        const outfitItems = outfitLayer.querySelectorAll('.outfit-item');
        
        if (outfitItems.length === 0) {
            alert('No outfit to save! Add some clothes first.');
            return;
        }
        
        // Create outfit data
        const outfitData = {
            id: Date.now(),
            name: `Outfit ${this.savedOutfits.length + 1}`,
            date: new Date().toLocaleDateString(),
            mood: this.currentMood,
            items: []
        };
        
        outfitItems.forEach(item => {
            const itemData = {
                emoji: item.dataset.emoji,
                type: item.dataset.type,
                x: parseFloat(item.style.left),
                y: parseFloat(item.style.top),
                isImage: item.querySelector('img') !== null
            };
            
            if (itemData.isImage) {
                itemData.imageSrc = item.querySelector('img').src;
            }
            
            outfitData.items.push(itemData);
        });
        
        // Save to localStorage
        this.savedOutfits.push(outfitData);
        localStorage.setItem('savedOutfits', JSON.stringify(this.savedOutfits));
        
        // Update display
        this.loadSavedOutfits();
        
        // Show success message
        this.showNotification('Outfit saved! 📸');
    }
    
    loadSavedOutfits() {
        const savedOutfitsGrid = document.getElementById('saved-outfits-grid');
        savedOutfitsGrid.innerHTML = '';
        
        this.savedOutfits.forEach(outfit => {
            const outfitElement = this.createSavedOutfitElement(outfit);
            savedOutfitsGrid.appendChild(outfitElement);
        });
    }
    
    createSavedOutfitElement(outfit) {
        const outfitDiv = document.createElement('div');
        outfitDiv.className = 'saved-outfit';
        
        // Create a canvas to render the outfit
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        // Draw dark brown background
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, 100, 100);
        
        // Draw hamster base using the new image
        const hamsterImg = new Image();
        hamsterImg.onload = () => {
            ctx.drawImage(hamsterImg, 10, 10, 80, 80);
        };
        hamsterImg.src = 'public/assets/ChatGPT Image Aug 7, 2025, 09_50_32 PM.png';
        
        // Draw outfit items
        outfit.items.forEach(item => {
            if (item.isImage && item.imageSrc) {
                // For image items, we'll draw a placeholder rectangle
                ctx.fillStyle = '#808080';
                ctx.fillRect(item.x - 10, item.y - 10, 20, 20);
                ctx.fillStyle = '#404040';
                ctx.fillRect(item.x - 8, item.y - 8, 16, 16);
            } else {
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(item.emoji, item.x, item.y);
            }
        });
        
        outfitDiv.innerHTML = `
            <img src="${canvas.toDataURL()}" alt="Saved outfit">
            <div class="outfit-name">${outfit.name}</div>
            <div class="outfit-date">${outfit.date}</div>
        `;
        
        outfitDiv.addEventListener('click', () => {
            this.loadOutfit(outfit);
        });
        
        return outfitDiv;
    }
    
    loadOutfit(outfit) {
        // Clear current outfit
        document.getElementById('outfit-layer').innerHTML = '';
        
        // Switch to the outfit's mood
        this.switchMood(outfit.mood);
        
        // Load outfit items
        outfit.items.forEach(item => {
            const outfitItem = document.createElement('div');
            outfitItem.className = 'outfit-item';
            
            if (item.isImage && item.imageSrc) {
                const img = document.createElement('img');
                img.src = item.imageSrc;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                outfitItem.appendChild(img);
            } else {
                outfitItem.textContent = item.emoji;
            }
            
            outfitItem.dataset.type = item.type;
            outfitItem.dataset.emoji = item.emoji;
            outfitItem.style.left = `${item.x}px`;
            outfitItem.style.top = `${item.y}px`;
            outfitItem.style.transform = 'translate(-50%, -50%)';
            
            document.getElementById('outfit-layer').appendChild(outfitItem);
        });
        
        this.showNotification(`Loaded ${outfit.name}! 👔`);
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(145deg, #deb887, #d2b48c);
            color: #654321;
            padding: 12px 18px;
            border-radius: 20px;
            border: 3px solid #8b4513;
            font-family: 'Press Start 2P', 'Courier New', monospace;
            font-size: 10px;
            font-weight: normal;
            text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.8);
            box-shadow: 
                0 4px 8px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.5),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            letter-spacing: 1px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DressUpHamster();
}); 