import contactsService from "./contacts.js";


const form = document.querySelector('#form-crear');
const inputFirstName = document.querySelector('#first-name');
const inputLastName = document.querySelector('#last-name');
const inputPhone = document.querySelector('#number');
const formButton = document.querySelector('.btn-crear');
const contactsList = document.querySelector('#contact-list');


const NAME_REGEX = /^[A-Z][a-z]+$/;
const PHONE_REGEX = /^[0](414|424|416|426|422|412|212)[0-9]{7}$/;

let isValidFirstName = false;
let isValidLastName = false;
let isValidPhone = false;


const handleStateInput = (input, isValid) => {

    const formGroup = input.closest('.form-group');

    if (!input.value) {
        formGroup.classList.remove('error');
        return;
    }

    if (isValid) {
        formGroup.classList.remove('error');

    } else {
        formGroup.classList.add('error');
    }
}

const handleFormBtnState = () => {

    formButton.disabled = !(isValidFirstName && isValidLastName && isValidPhone);
}


const renderContacts = (contacts) => {
    contactsList.innerHTML = '';

    contacts.forEach(contact => {
        const li = document.createElement('li');
        li.classList.add('contact-item');
        li.id = contact.id;

        const inputNameLi = document.createElement('input');
        inputNameLi.type = 'text';
        inputNameLi.classList.add('contact-name');
        inputNameLi.value = `${contact.firstName} ${contact.lastName}`;
        inputNameLi.readOnly = true;

        const inputPhoneLi = document.createElement('input');
        inputPhoneLi.type = 'text';
        inputPhoneLi.classList.add('contact-number');
        inputPhoneLi.value = contact.phone;
        inputPhoneLi.readOnly = true;

        const divActions = document.createElement('div');
        divActions.classList.add('contact-actions');

        const btnEdit = document.createElement('button');
        btnEdit.classList.add('btn-action', 'btn-edit');
        btnEdit.setAttribute('aria-label', 'Editar');
        btnEdit.innerHTML = '<i class="fas fa-pencil-alt"></i>';

        const btnDelete = document.createElement('button');
        btnDelete.classList.add('btn-action', 'btn-delete');
        btnDelete.setAttribute('aria-label', 'Eliminar');
        btnDelete.innerHTML = '<i class="fas fa-times"></i>';

        divActions.appendChild(btnEdit);
        divActions.appendChild(btnDelete);

        li.appendChild(inputNameLi);
        li.appendChild(inputPhoneLi);
        li.appendChild(divActions);

        contactsList.append(li);
    });
}



inputFirstName.addEventListener('input', () => {
    isValidFirstName = NAME_REGEX.test(inputFirstName.value);
    handleStateInput(inputFirstName, isValidFirstName);
    handleFormBtnState();
});

inputLastName.addEventListener('input', () => {
    isValidLastName = NAME_REGEX.test(inputLastName.value);
    handleStateInput(inputLastName, isValidLastName);
    handleFormBtnState();
});

inputPhone.addEventListener('input', e => {
    isValidPhone = PHONE_REGEX.test(inputPhone.value);
    handleStateInput(inputPhone, isValidPhone);
    handleFormBtnState();
});

form.addEventListener('submit', e => {
    e.preventDefault();

    if (!isValidFirstName || !isValidLastName || !isValidPhone) {
        alert("Por favor verifica los errores en el formulario");
        return;
    }

    contactsService.addContact({
        firstName: inputFirstName.value,
        lastName: inputLastName.value,
        phone: inputPhone.value
    });
    contactsService.saveContactsInBrowser();


    inputFirstName.value = '';
    inputLastName.value = '';
    inputPhone.value = '';
    isValidFirstName = false;
    isValidLastName = false;
    isValidPhone = false;


    inputFirstName.closest('.form-group').classList.remove('error');
    inputLastName.closest('.form-group').classList.remove('error');
    inputPhone.closest('.form-group').classList.remove('error');

    handleFormBtnState();

    const contacts = contactsService.getContacts();
    renderContacts(contacts);
});



contactsList.addEventListener('click', e => {
    const deleteBtn = e.target.closest('.btn-delete');
    const editBtn = e.target.closest('.btn-edit');


    if (deleteBtn) {
        const li = deleteBtn.closest('.contact-item');

        li.classList.add('removing');
        li.addEventListener('animationend', () => {
            contactsService.deleteContact(li.id);
            contactsService.saveContactsInBrowser();
            li.remove();
        });
    }


    if (editBtn) {
        const li = editBtn.closest('.contact-item');
        const id = li.id;

        const liNameInput = li.querySelector('.contact-name');
        const liPhoneInput = li.querySelector('.contact-number');
        const icon = editBtn.querySelector('i');

        const isEditing = li.classList.contains('editing');

        if (isEditing) {


            const [newFirstName, newLastName] = liNameInput.value.split(' ');
            const newPhone = liPhoneInput.value;


            const isFirstNameValid = NAME_REGEX.test(newFirstName);
            const isLastNameValid = NAME_REGEX.test(newLastName);
            const isPhoneValid = PHONE_REGEX.test(newPhone);


            liNameInput.style.borderColor = isFirstNameValid ? '' : 'var(--delete-color)';
            liPhoneInput.style.borderColor = isPhoneValid ? '' : 'var(--delete-color)';

            if (!isFirstNameValid || !isLastNameValid || !isPhoneValid) {

                return;
            }



            contactsService.updateContact(id, {
                firstName: newFirstName,
                lastName: newLastName,
                phone: newPhone
            });
            contactsService.saveContactsInBrowser();


            li.classList.remove('editing');
            liNameInput.readOnly = true;
            liPhoneInput.readOnly = true;


            icon.classList.remove('fa-save');
            icon.classList.add('fa-pencil-alt');
            editBtn.classList.remove('editing');

        } else {

            li.classList.add('editing');

            liNameInput.readOnly = false;
            liPhoneInput.readOnly = false;


            liNameInput.focus();


            icon.classList.remove('fa-pencil-alt');
            icon.classList.add('fa-save');
            editBtn.classList.add('editing');
        }
    }
});


window.onload = () => {

    inputFirstName.value = '';
    inputLastName.value = '';
    inputPhone.value = '';

    contactsService.getContactsFromBrowser();
    const contacts = contactsService.getContacts();
    renderContacts(contacts);
}