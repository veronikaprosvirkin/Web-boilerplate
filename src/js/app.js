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
const teacherList = document.querySelector('.teacher-list');

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
const showMoreBtn = document.querySelector('.show-more-btn');

// Initializing variables
let visibleCount = 10;
let currentFilteredUsers = [];
let finalUsers = [];

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
        full_name: `${user.name.first} ${user.name.last}`,
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
    return getUserValidationErrors(user).length === 0;
}

//returning the errors
function getUserValidationErrors(user) {
    const errors = [];
    if(typeof(user.age) != "number" || isNaN(user.age) || user.age < 18 || user.age > 100){
        errors.push("Incorrect age. Age must be a number between 18 and 100");
    }
    if (!user.email.includes("@")){
        errors.push("Email must contain @");
    }
    if(!isCapitalized(user.full_name)){
        errors.push("Full name must be capitalized");
    }
    if(!isCapitalized(user.gender)){
        errors.push("Gender must be capitalized");
    }
    if(!isCapitalized(user.city)){
        errors.push("City must be capitalized");
    }
    if(!isCapitalized(user.country)){
        errors.push("Country must be capitalized");
    }
    if(!isCapitalized(user.note)){
        errors.push("Note must be capitalized");
    }
    if (!/^[0-9\+\-\s\(\)]+$/.test(user.phone)){
        errors.push("Phone number is invalid");
    }
    return errors;
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

//rewrite
function sortUsers(users, key, order = 'asc') {
    return [...users].sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
            return order === 'asc' ? valA - valB : valB - valA;
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
            const comparison = valA.localeCompare(valB, undefined, { sensitivity: 'base' });
            return order === 'asc' ? comparison : -comparison;
        }

        return 0;
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

const popupStarBtn = popup.querySelector('.star-button');
let currentPopupTeacher = null;

//teacher popups
function openTeacherPopup(teacher) {
    currentPopupTeacher = teacher;

    popupName.textContent = teacher.full_name; 
    popupImg.src = teacher.picture_large;      
    popupSpeciality.textContent = teacher.course;
    popupEmail.href = `mailto:${teacher.email}`;
    popupLocation.textContent = `${teacher.city}, ${teacher.state}, ${teacher.country}`;
    popupAgeSex.textContent = `${teacher.age}, ${teacher.gender}`;
    popupEmail.textContent = teacher.email;
    popupPhone.textContent = teacher.phone;
    popupDescription.textContent = teacher.note;

    popupStarBtn.textContent = teacher.favorite ? '★' : '☆';

    popup.classList.add('active');
}

popupStarBtn.addEventListener('click', () => {
    if (!currentPopupTeacher) return;

    currentPopupTeacher.favorite = !currentPopupTeacher.favorite;
    saveFavoritesToStorage();


    popupStarBtn.textContent = currentPopupTeacher.favorite ? '★' : '☆';

    renderTeachers(finalUsers);
    renderFavorites(finalUsers);
});

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

        tableData = sortUsers(tableData, key, currentSortOrder);
        displayTablePage(1);
    });
});

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
                    return ['Iran', 'Turkey', 'India', 'China'].includes(country);
                }
                if (regionFilter.value === 'North America') {
                    return ['United States', 'Canada', 'USA'].includes(country);
                }
                return false;
            });
        }
        visibleCount = 10;
        renderTeachers(filteredUsers);
        tableData = filteredUsers;
        displayTablePage(1);
    });
}

// Render functions
function renderTeachers(usersArray) {
    currentFilteredUsers = usersArray;
    const teacherList = document.querySelector('.teacher-list');
    if (!teacherList) return;

    const visibleTeachers = usersArray.slice(0, visibleCount);

    teacherList.innerHTML = visibleTeachers.map((user) => {
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

        const starMarkup = `<span class="star-icon ${user.favorite ? 'star-icon_active' : ''}" data-id="${user.id}">${user.favorite ? '★' : '☆'}</span>`;

        return `
            <div class="teacher-card" data-id="${user.id}">
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

    if (showMoreBtn) {
        if (visibleCount >= usersArray.length) {
            showMoreBtn.style.display = 'none';
        } else {
            showMoreBtn.style.display = 'block';
        }
    }
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
         const starMarkup = `<span class="star-icon ${user.favorite ? 'star-icon_active' : ''}" data-id="${user.id}">${user.favorite ? '★' : '☆'}</span>`;

        return `
            <div class="teacher-card" data-id="${user.id}">
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

//LAB 3

teacherList.addEventListener('click', (event) => {
    const starEl = event.target.closest('.star-icon');
    if (starEl) {
        const starId = starEl.getAttribute('data-id');
        const targetUser = finalUsers.find(user => user.id === starId);

        if (targetUser) {
            targetUser.favorite = !targetUser.favorite;
            saveFavoritesToStorage();
            renderTeachers(currentFilteredUsers);
            renderFavorites(finalUsers);
        }
        return;
    }

    const cardEl = event.target.closest('.teacher-card');
    if (cardEl) {
        const cardId = cardEl.getAttribute('data-id');
        const clickedTeacher = finalUsers.find(user => user.id === cardId);

        if (clickedTeacher) {
            openTeacherPopup(clickedTeacher);
        }
    }
});

addTeacherPopup.querySelector('.popup-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = event.target;
    const dobValue = form.querySelector('#dob').value;
    const birthYear = dobValue ? new Date(dobValue).getFullYear() : null;
    const calculatedAge = birthYear ? new Date().getFullYear() - birthYear : null;

    const newTeacher = {
        id: Date.now().toString(),
        full_name: form.querySelector('#name').value.trim(),
        course: form.querySelector('#specialty').value,
        country: form.querySelector('#country').value,
        city: form.querySelector('#city').value.trim(),
        email: form.querySelector('#email').value.trim(),
        phone: form.querySelector('#phone').value.trim(),
        b_date: dobValue,
        age: calculatedAge,
        gender: form.querySelector('input[name="sex"]:checked')?.value || '',
        bg_color: form.querySelector('#bgcolor').value,
        note: form.querySelector('#notes').value.trim() || 'Empty',
        favorite: false
    };

    const validationErrors = getUserValidationErrors(newTeacher); 
    if (validationErrors.length > 0) {
        alert("Validation errors:\n" + validationErrors.join("\n"));
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/teachers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTeacher),
        });

        if (response.ok) {
            const savedTeacher = await response.json();
            
            finalUsers.unshift(savedTeacher);
            renderTeachers(finalUsers);
            renderFavorites(finalUsers);
            tableData = [...finalUsers];
            displayTablePage(1);
            
            addTeacherPopup.classList.remove('active');
            form.reset();
        }
    } catch (error) {
        console.error('Error saving teacher to json-server:', error);
    }
});

//Edited in lab 4
if (showMoreBtn) {
    showMoreBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('https://randomuser.me/api/?results=10&seed=teachers_app_more');
            const data = await response.json();
            const newUsers = data.results.map(formatUser);
            finalUsers = [...finalUsers, ...newUsers];
            visibleCount += 10;
            tableData = [...finalUsers];
            renderTeachers(finalUsers);
            displayTablePage(currentPage);
        } catch (error) {
            console.error('Error fetching more teachers:', error);
        }
    });
}

//LAB 4

async function fetchTeachers() {
    try {
        const response = await fetch('https://randomuser.me/api/?results=50&seed=teachers_app');
        const data = await response.json();
        const users = data.results;

        const mergedApiUsers = mergeTeachers(users, additionalUsers);
        let savedTeachers = [];
        try {
            const localResponse = await fetch('http://localhost:3000/teachers');
            savedTeachers = await localResponse.json();
        } catch (e) {
            console.warn('Could not fetch saved teachers from json-server. Proceeding without them.', e);
        }

        const uniqueSaved = savedTeachers.filter(st => !mergedApiUsers.some(u => u.id === st.id));

        finalUsers = [...uniqueSaved, ...mergedApiUsers];

        const favoriteIds = loadFavoritesFromStorage();
        if (favoriteIds.length > 0) {
            finalUsers.forEach(user => {
                user.favorite = favoriteIds.includes(user.id);
            });
        }

        tableData = [...finalUsers];
        renderTeachers(finalUsers);
        renderFavorites(finalUsers);
        displayTablePage(1);

    } catch (error) {
        console.error('Error fetching teachers:', error);
    }
}

function saveFavoritesToStorage() {
    const favoriteIds = finalUsers.filter(user => user.favorite).map(user => user.id);
    localStorage.setItem('favoriteTeachers', JSON.stringify(favoriteIds));
}

function loadFavoritesFromStorage() {
    const favoriteIds = JSON.parse(localStorage.getItem('favoriteTeachers')) || [];
    return favoriteIds;
}

fetchTeachers();
