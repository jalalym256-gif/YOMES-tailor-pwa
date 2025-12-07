// داده‌های اصلی
let customers = [];
let currentIndex = null;

// نمایش اعلان
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, duration);
}

// افزودن مشتری جدید
function addCustomer() {
    const name = prompt('نام مشتری:');
    if (!name || name.trim() === '') {
        showNotification('لطفاً نام معتبر وارد کنید', 'warning');
        return;
    }
    
    const phone = prompt('شماره تماس:');
    if (!phone || phone.trim() === '') {
        showNotification('لطفاً شماره معتبر وارد کنید', 'warning');
        return;
    }
    
    const newCustomer = {
        id: Date.now(),
        name: name.trim(),
        phone: phone.trim(),
        measurements: {},
        orders: [],
        notes: '',
        createdAt: new Date().toISOString()
    };
    
    customers.push(newCustomer);
    saveToLocalStorage();
    renderCustomerList();
    updateStats();
    
    showNotification(`مشتری "${name}" اضافه شد`, 'success');
}

// ذخیره در localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem('tailorCustomers', JSON.stringify(customers));
        return true;
    } catch (error) {
        showNotification('خطا در ذخیره‌سازی داده‌ها', 'error');
        return false;
    }
}

// بارگذاری از localStorage
function loadFromLocalStorage() {
    try {
        const stored = localStorage.getItem('tailorCustomers');
        if (stored) {
            customers = JSON.parse(stored);
        }
    } catch (error) {
        customers = [];
    }
}

// نمایش لیست مشتریان
function renderCustomerList() {
    const container = document.getElementById('customerList');
    if (!container) return;
    
    if (customers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>هنوز مشتری اضافه نشده است</h3>
                <p>برای شروع، روی دکمه "مشتری جدید" کلیک کنید</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    customers.forEach((customer, index) => {
        html += `
            <div class="customer-item" onclick="openProfile(${index})">
                <div>
                    <span class="customer-number">${index + 1}</span>
                    <strong>${customer.name}</strong> - ${customer.phone}
                    ${customer.notes ? `<br><small>${customer.notes.substring(0, 50)}...</small>` : ''}
                </div>
                <button onclick="event.stopPropagation(); openProfile(${index})">
                    <i class="fas fa-user-circle"></i> مشاهده
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// باز کردن پروفایل مشتری
function openProfile(index) {
    if (index < 0 || index >= customers.length) return;
    
    currentIndex = index;
    const customer = customers[index];
    
    document.getElementById('profileName').textContent = customer.name;
    document.getElementById('profilePhone').textContent = customer.phone;
    
    // مخفی کردن لیست و نمایش پروفایل
    document.getElementById('customerList').style.display = 'none';
    document.getElementById('profilePage').classList.remove('hidden');
    
    // ایجاد جدول اندازه‌گیری‌ها
    renderMeasurementsTable();
}

// بازگشت به صفحه اصلی
function backHome() {
    document.getElementById('profilePage').classList.add('hidden');
    document.getElementById('customerList').style.display = 'block';
    renderCustomerList();
}

// ایجاد جدول اندازه‌گیری
function renderMeasurementsTable() {
    if (currentIndex === null) return;
    
    const customer = customers[currentIndex];
    const measurements = customer.measurements || {};
    const container = document.getElementById('measurementsBody');
    
    const measurementFields = [
        { id: 'height', label: 'قد', unit: 'cm' },
        { id: 'chest', label: 'دور سینه', unit: 'cm' },
        { id: 'waist', label: 'دور کمر', unit: 'cm' },
        { id: 'hip', label: 'دور باسن', unit: 'cm' },
        { id: 'shoulder', label: 'شانه', unit: 'cm' },
        { id: 'arm', label: 'آستین', unit: 'cm' },
        { id: 'pants', label: 'شلوار', unit: 'cm' }
    ];
    
    let html = '';
    measurementFields.forEach(field => {
        const value = measurements[field.id] || '';
        html += `
            <tr>
                <td>${field.label} (${field.unit})</td>
                <td>
                    <input type="text" 
                           data-field="${field.id}"
                           value="${value}"
                           oninput="updateMeasurement('${field.id}', this.value)"
                           class="measurement-input">
                </td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
}

// بروزرسانی اندازه‌گیری
function updateMeasurement(field, value) {
    if (currentIndex === null) return;
    
    if (!customers[currentIndex].measurements) {
        customers[currentIndex].measurements = {};
    }
    
    customers[currentIndex].measurements[field] = value;
    saveToLocalStorage();
}

// جستجوی مشتری
function searchCustomer() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderCustomerList();
        return;
    }
    
    const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm) || 
        customer.phone.includes(searchTerm)
    );
    
    const container = document.getElementById('customerList');
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>مشتری یافت نشد</h3>
                <p>هیچ مشتری با مشخصات "${searchTerm}" پیدا نشد</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    filtered.forEach((customer, index) => {
        const originalIndex = customers.findIndex(c => c.id === customer.id);
        html += `
            <div class="customer-item" onclick="openProfile(${originalIndex})">
                <div>
                    <span class="customer-number">${originalIndex + 1}</span>
                    <strong>${customer.name}</strong> - ${customer.phone}
                </div>
                <button onclick="event.stopPropagation(); openProfile(${originalIndex})">
                    <i class="fas fa-user-circle"></i> مشاهده
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// بروزرسانی آمار
function updateStats() {
    document.getElementById('totalCustomers').textContent = customers.length;
    
    const totalOrders = customers.reduce((sum, customer) => {
        return sum + (customer.orders ? customer.orders.length : 0);
    }, 0);
    
    document.getElementById('totalOrders').textContent = totalOrders;
}

// چاپ لیبل
function printLabel() {
    if (currentIndex === null) {
        showNotification('لطفاً ابتدا یک مشتری انتخاب کنید', 'warning');
        return;
    }
    
    const customer = customers[currentIndex];
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <title>لیبل مشتری</title>
            <style>
                body { font-family: Tahoma; padding: 20px; }
                .label { border: 2px solid #000; padding: 15px; margin: 10px; }
                h2 { color: #D4AF37; }
            </style>
        </head>
        <body>
            <div class="label">
                <h2>YONES - خیاطی</h2>
                <p><strong>نام:</strong> ${customer.name}</p>
                <p><strong>تلفن:</strong> ${customer.phone}</p>
                <p><strong>تاریخ:</strong> ${new Date().toLocaleDateString('fa-IR')}</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
    showNotification('لیبل آماده چاپ است', 'success');
}

// تنظیمات
function toggleSettings() {
    const dropdown = document.getElementById('settingsDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// تغییر حالت تاریک/روشن
function toggleDarkMode() {
    document.body.style.backgroundColor = '#1A1A1A';
    document.body.style.color = '#F5F5F5';
    showNotification('حالت تاریک فعال شد', 'info');
    toggleSettings();
}

function toggleLightMode() {
    document.body.style.backgroundColor = '#F8F9FA';
    document.body.style.color = '#333';
    showNotification('حالت روشن فعال شد', 'info');
    toggleSettings();
}

// ذخیره داده‌ها
function saveData() {
    if (saveToLocalStorage()) {
        showNotification('اطلاعات با موفقیت ذخیره شدند', 'success');
    }
    toggleSettings();
}

// بارگذاری اولیه
function initApp() {
    loadFromLocalStorage();
    renderCustomerList();
    updateStats();
    
    // بستن منوی تنظیمات با کلیک خارج
    document.addEventListener('click', (event) => {
        const settingsMenu = document.querySelector('.settings-menu');
        const dropdown = document.getElementById('settingsDropdown');
        
        if (settingsMenu && !settingsMenu.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });
}

// اجرای برنامه
window.onload = initApp;
