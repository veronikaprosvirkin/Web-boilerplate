import testModules from './test-module.js';
import { randomUserMock, additionalUsers } from './mock.js';

console.log(testModules.hello);
console.log("Random User Mock:", randomUserMock);
console.log("Additional Users:", additionalUsers);

// Selecting DOM elements
const favoritesGrid = document.querySelector('.favorites-grid');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');
const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('.search-input');
const tableHeaders = document.querySelectorAll('.statistics-table th');
const paginationContainer = document.querySelector('.pagination');
const filtersContainer = document.querySelector('.filters');
const ageFilter = document.querySelector('#filter-age');
const regionFilter = document.querySelector('#filter-region');
const sexFilter = document.querySelector('#sex-filter');
const photoFilter = document.querySelector('#with-photo-filter');
const favoriteFilter = document.querySelector('#favorite-filter');

//popup information
const popup = document.querySelector('.teacher-info-popup');
const closePopupBtn = popup.querySelector('.close-button');
const addTeacherPopup = document.querySelector('.add-teacher-popup');
const closeAddPopupBtn = addTeacherPopup.querySelector('.close-button');
const addTeacherBtns = document.querySelectorAll('.add-teacher-button');

//popup elements
const popupImg = popup.querySelector('.teacher-info-img');
const popupName = popup.querySelector('.name-row h3');
const popupSpeciality = popup.querySelector('.speciality');
const popupLocation = popup.querySelector('.location');
const popupAgeSex = popup.querySelector('.age-sex');
const popupEmail = popup.querySelector('.email-link');
const popupPhone = popup.querySelector('.phone');
const popupDescription = popup.querySelector('.teacher-description');

//scroll functionality
const scrollAmount = 240;

leftArrow.addEventListener('click', () => {
    favoritesGrid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
});

rightArrow.addEventListener('click', () => {
    favoritesGrid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
});


const coursesList = ['Mathematics', 'Physics', 'English', 'Computer Science', 'Dancing', 'Chess', 'Biology', 'Chemistry', 'Law', 'Art', 'Medicine', 'Statistics'];

function formatUser(user) {
    return {
        gender: user.gender,
        title: user.name.title,
        full_name: `${user.name.first} ${user.name.last}`, // За зразком поле називається full_name, а не name. І я прибрала зайвий пробіл перед $
        city: user.location.city,
        state: user.location.state,
        country: user.location.country,
        postcode: user.location.postcode,
        coordinates: {
            latitude: user.location.coordinates.latitude,
            longitude: user.location.coordinates.longitude,
        },
        timezone: {
            offset: user.location.timezone.offset,
            description: user.location.timezone.description,
        },
        email: user.email,
        b_date: user.dob.date,
        age: user.dob.age,
        phone: user.phone,
        picture_large: user.picture.large,
        picture_thumbnail: user.picture.thumbnail,
        
        id: user.login.uuid,
        favorite: false,    
        bg_color: '#ffffff', 
        note: "Empty",          
        
        course: coursesList[Math.floor(Math.random() * coursesList.length)],
    };
}

function mergeTeachers(users, additionalUsers) {
    const formattedUsers = users.map(formatUser);
    const allUsers = [...formattedUsers, ...additionalUsers];

    const uniqueUsers = [];

    allUsers.forEach(user => {
        const existingIndex = uniqueUsers.findIndex(u => 
            (u.email && user.email && u.email === user.email) || 
            (u.full_name === user.full_name)
        );

        if (existingIndex !== -1) {
            for (let key in user) {
                if (user[key] !== null && user[key] !== undefined) {
                    uniqueUsers[existingIndex][key] = user[key];
                }
            }
        } else {
            uniqueUsers.push({ ...user });
        }
    });

    return uniqueUsers;
}

function isValidUser(user) {
    if(typeof(user.age) != "number"){
        return false;
    }
    else if (!user.email.includes("@")){
        return false;
    }
    else if(!isCapitalized(user.full_name) || !isCapitalized(user.gender) 
        || !isCapitalized(user.city) || !isCapitalized(user.country) || !isCapitalized(user.state)
        || !isCapitalized(user.note)){
        return false;
    }
    else if (!/^[0-9\+\-\s\(\)]+$/.test(user.phone)){
        return false;
    }
    return true;
}

//additoinal function
function isCapitalized(str) {
    if (typeof(str) != "string" || str.length === 0){
        return false;
    }
    else if(str[0] === str[0].toUpperCase()){
        return true;
    }
    return false;
}

function filterUsers(users, params) {
    return users.filter(user => {
        for (const key in params) {
            if (user[key] !== params[key]) {
                return false;
            }
        }
        return true;
    });
}

function sortUsers(users, key, order = 'asc') {
    return [...users].sort((a, b) => {
        if (a[key] === b[key]) {
            return 0;
        }
        else if (order === 'asc') {
            return a[key] > b[key] ? 1 : -1;
        } else {
            return a[key] < b[key] ? 1 : -1;
        }
    });
}

function findUser(users, key, value) {
    return users.find((user) => {
        if (typeof user[key] === 'string' && typeof value === 'string') {
            return user[key].toLowerCase().includes(value.toLowerCase());
        }
        return user[key] === value;
    });
}

function getPercentage(users, key, value){

    const filteredCount = users.filter(user => user[key] === value).length;
    return Math.round((filteredCount / users.length) * 100);
}

//Search form
searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const searchValue = searchInput.value;
    let foundTeacher;
    foundTeacher = findUser(finalUsers, 'full_name', searchValue);
    if (!foundTeacher){
        foundTeacher = findUser(finalUsers, 'note', searchValue);
    }
    if (!foundTeacher){
        foundTeacher = findUser(finalUsers, 'age', parseInt(searchValue));
    }
    if (!foundTeacher){
        foundTeacher = findUser(finalUsers, 'country', searchValue);
    }
    if(!foundTeacher){
        foundTeacher = findUser(finalUsers, 'course', searchValue);
    }

    if (foundTeacher) {
        openTeacherPopup(foundTeacher);
    } else {
        console.log('Teacher not found');
    }
});

//teacher popups
function openTeacherPopup(teacher) {
    popupName.textContent = teacher.full_name; 
    popupImg.src = teacher.picture_large;      
    popupSpeciality.textContent = teacher.course;
    popupEmail.href = `mailto:${teacher.email}`;
    popupLocation.textContent = `${teacher.city}, ${teacher.state}, ${teacher.country}`;
    popupAgeSex.textContent = `${teacher.age}, ${teacher.gender}`;
    popupEmail.textContent = teacher.email;
    popupPhone.textContent = teacher.phone;
    popupDescription.textContent = teacher.note;

    popup.classList.add('active');
}

// Close popup 
closePopupBtn.addEventListener('click', () => {
    popup.classList.remove('active');
});

addTeacherBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        addTeacherPopup.classList.add('active');
    });
});

closeAddPopupBtn.addEventListener('click', () => {
    addTeacherPopup.classList.remove('active');
});

// Sorting functionality
let currentSortColumn = null;
let currentSortOrder = 'asc';

tableHeaders.forEach(th => {
    th.addEventListener('click', () => {
        const key = th.getAttribute('data-key');
        if (!key) return;

        if (currentSortColumn === key) {
            currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = key;
            currentSortOrder = 'asc'; 
        }

        tableData = sortUsers(finalUsers, key, currentSortOrder);
        displayTablePage(1);
    });
});

const finalUsers = mergeTeachers(randomUserMock, additionalUsers);
console.log(finalUsers);

// Pagination functionality
const usersPerPage = 10;
let currentPage = 1;
let tableData = [...finalUsers];

function displayTablePage(page) {
    currentPage = page;
    const startIndex = (page - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const paginatedUsers = tableData.slice(startIndex, endIndex);
    
    renderStatistics(paginatedUsers);
    updatePaginationButtons();
}

function updatePaginationButtons() {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    
    const totalPages = Math.ceil(tableData.length / usersPerPage);
    
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('a');
        btn.href = '#';
        btn.textContent = i;
        
        if (i === currentPage) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', (event) => {
            event.preventDefault(); 
            displayTablePage(i);
        });
        
        paginationContainer.appendChild(btn);
    }
}

//filter functionality
if (filtersContainer) {
    filtersContainer.addEventListener('change', () => {
        let filteredUsers = [...finalUsers];

        if (sexFilter.value !== 'All') {
            filteredUsers = filteredUsers.filter(user => 
                user.gender.toLowerCase() === sexFilter.value.toLowerCase()
            );
        }
        if (photoFilter.checked) {
            filteredUsers = filteredUsers.filter(user => user.picture_large);
        }
        if (favoriteFilter.checked) {
            filteredUsers = filteredUsers.filter(user => user.favorite === true);
        }
        const ageVal = ageFilter.value;
        if (ageVal === '18-31') {
            filteredUsers = filteredUsers.filter(u => u.age >= 18 && u.age <= 31);
        } else if (ageVal === '32-40') {
            filteredUsers = filteredUsers.filter(u => u.age >= 32 && u.age <= 40);
        } else if (ageVal === '41-50') {
            filteredUsers = filteredUsers.filter(u => u.age >= 41 && u.age <= 50);
        } else if (ageVal === '51+') {
            filteredUsers = filteredUsers.filter(u => u.age >= 51);
        }
        if (regionFilter.value !== 'All') {
            filteredUsers = filteredUsers.filter(user => {
                const country = user.country;
                if (regionFilter.value === 'Europe') {
                    return ['Germany', 'Switzerland', 'Denmark', 'Spain', 'Finland', 'France', 'United Kingdom', 'Ireland', 'Norway', 'Netherlands', 'Turkey', 'Ukraine', 'Belgium'].includes(country);
                }
                if (regionFilter.value === 'Asia') {
                    return ['Iran', 'Turkey', 'India', 'China'].includes(country); // Туреччину залишаємо в обох, бо вона на межі :)
                }
                if (regionFilter.value === 'North America') {
                    return ['United States', 'Canada', 'USA'].includes(country);
                }
                return false;
            });
        }
        renderTeachers(filteredUsers);
    });
}

// Render functions
function renderTeachers(usersArray) {
    const teacherList = document.querySelector('.teacher-list');

    if (!teacherList) return;

    teacherList.innerHTML = usersArray.map((user) => {
        const fullName = user.full_name || 'Unknown Teacher';
        const course = user.course || 'Unknown course';
        const country = user.country || 'Unknown country';
        const initials = user.full_name
            ? user.full_name
                .split(' ')
                .map((namePart) => namePart[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
            : 'N/A';

        const imageMarkup = user.picture_large
            ? `<img src="${user.picture_large}" alt="${fullName}" class="teacher-photo">`
            : `<span class="initials">${initials}</span>`;

        const starMarkup = user.favorite ? '<span class="star-icon">★</span>' : '';

        return `
            <div class="teacher-card">
                <div class="image-container">
                    ${imageMarkup}
                    ${starMarkup}
                </div>
                <h3 class="teacher-name">${fullName}</h3>
                <p class="teacher-specialty">${course}</p>
                <p class="teacher-location">${country}</p>
            </div>
        `;
    }).join('');
}

function renderStatistics(usersArray) {
    const statisticsBody = document.querySelector('.statistics-table tbody');

    if (!statisticsBody) return;

    statisticsBody.innerHTML = usersArray.map((user) => `
        <tr>
            <td>${user.full_name || 'Unknown'}</td>
            <td>${user.course || 'Unknown course'}</td>
            <td>${user.age || 'N/A'}</td>
            <td>${user.gender || 'Unknown'}</td>
            <td>${user.country || 'Unknown country'}</td>
        </tr>
    `).join('');
}

function renderFavorites(usersArray) {
    const favoritesContainer = document.querySelector('.favorites-grid');

    if (!favoritesContainer) return;

    const favoriteTeachers = usersArray.filter((user) => user.favorite === true).slice(0, 5);
    const teachersToRender = favoriteTeachers.length ? favoriteTeachers : usersArray.slice(0, 5);

    favoritesContainer.innerHTML = teachersToRender.map((user) => {
        const fullName = user.full_name || 'Unknown Teacher';
        const country = user.country || 'Unknown country';
        const initials = user.full_name
            ? user.full_name
                .split(' ')
                .map((namePart) => namePart[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
            : 'N/A';

        const imageMarkup = user.picture_large
            ? `<img src="${user.picture_large}" alt="${fullName}" class="teacher-photo">`
            : `<span class="initials">${initials}</span>`;
         const starMarkup = user.favorite ? '<span class="star-icon">★</span>' : '';

        return `
            <div class="teacher-card">
                <div class="image-container">
                    ${imageMarkup}
                    ${starMarkup}
                </div>
                <h3 class="teacher-name">${fullName}</h3>
                <p class="teacher-location">${country}</p>
            </div>
        `;
    }).join('');
}

renderTeachers(finalUsers);
displayTablePage(1);
renderFavorites(finalUsers);

console.log("Percentage of femala teachers:", getPercentage(finalUsers, 'gender', 'female') + "%");
console.log("Percentage of male teachers:", getPercentage(finalUsers, 'gender', 'male') + "%");