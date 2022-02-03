
// key - type modal: 'edit','delete'
const modals = new Map();

let roles = [];

const users = new Map();
let persons = [];


function change_text_input() {

    const li_root = $('#li-person');
    li_root.empty();

    let arr_el_person = [];
    const strSearch = $('#person-text-search').val();
    for (let person of persons) {
        if (person.name.toLowerCase().includes(strSearch.toLowerCase())) {
            arr_el_person.push(
                $('<li></li>').append($('<button class="btn btn-outline-info dropdown-item"></button>').text(person))
            );
        }
    }
    if (arr_el_person.length > 0) {
        li_root.append(arr_el_person);
    }

    let el = document.getElementById('person-text-search');
    let dropdown = new bootstrap.Dropdown(el);
    dropdown.show();

}

function submitEditForm() {

    let objectForPost = {};

    $("#EditForm [json = 'true']").each(
        function (index, htmlElement){
            objectForPost[htmlElement.getAttribute('name')] = htmlElement.value;
            //htmlElement.getAttribute('name') + ": " + htmlElement.value
        }
    );
    console.log(objectForPost);

    objectForPost = {
        'name': $('#inputEdit-User-Name').val(),
        'password': $('#inputEdit-User-Password').val(),
        'active': $('#inputEdit-User-Active').prop('checked'),
        'person': $('#inputEdit-User-Person').val(),
        'roles': []
    };

    let elRoles = $('#inputEdit-User-Roles tr');
    for (let trRole of elRoles) {
        let roleEl = $(trRole);
        if (roleEl.find('input').prop('checked')) {
            objectForPost.roles.push(roleEl.children('td')[0].value);
        }
    }
    console.log(objectForPost);

    const formObject = new FormData(document.getElementById('EditForm'));
    console.log(formObject);

    modals.get('edit').hide();
}

function submitDeleteForm() {

}

function initMap() {
    let arrUsers = getUsers();
    users.clear();
    for (let user of arrUsers) {
        users.set(user.id, user);
    }
}

function openEditModal(id) {
    const editModalEl = document.getElementById('editModal');
    const editModal = new bootstrap.Modal(editModalEl);
    const user = users.get(id);
    $('#editModalLabel').text('ID: ' + id);
    $('#inputEdit-User-Name').val(user.name);
    $('#inputEdit-User-Active').prop('checked', user.active);
    const elPersonInput = $('#inputEdit-User-Person');
    const elPersonInputId = $("#inputEdit-User-Person-ID");
    elPersonInput.autocomplete({
        //source: persons,
        source: 'https://176a5ad1-f540-44cf-b4ce-032887c674fa.mock.pstmn.io/persons',
        appendTo: editModalEl,
        autoFocus: true,
        select: function (event, ui) {
            elPersonInput.val(ui.item.label); // display the selected text
            elPersonInputId.val(ui.item.value); // save selected id to hidden input
            return false;
        }
    })
    elPersonInput.val(user.person.name);
    elPersonInputId.val(user.person.id);
    const inputRoles = $('#inputEdit-User-Roles');
    inputRoles.empty();
    for (let role of roles) {
        let elDiv = $('<tr></tr>');
        elDiv.append($('<td></td>').text(role.description).val(role.name));
        elDiv.append($('<td class="text-center"></td>').append($('<input type="checkbox" className="form-check-input" value="">').prop('checked', getRoleCheck(role.name, user.roles))));
        inputRoles.append(elDiv);
    }
    editModal.show();
}

function fillTable(tableId){

    initMap();

    $('#count').text("Размер списка: " + users.size);

    let orderFields = [];
    $('#users-table thead tr:first th').each(
        function (index, htmlElementTH) {
            orderFields.push(
                {
                    'key' : htmlElementTH.getAttribute('col-ref'),
                    'hidden' : htmlElementTH.getAttribute('hidden')
                }

            );
        }
    );

    let lines = [];
    for (let user of users.values()) {
        let dataOfLine = [];
        for (let field of orderFields) {
            const fieldKey = field.key;
            const fieldValue = user[fieldKey];
            switch (fieldKey) {
                case 'roles' : {
                    for (let role of roles) {
                        dataOfLine.push(
                            $('<td class="text-center"></td>').html(getIconFromLibrary(getRoleCheck(role.name, fieldValue) ? 'check-square' : 'square'))
                        );
                    }
                    break;
                }
                case 'tools' : {
                    dataOfLine.push(
                        getTableToolbar(user.id)
                    );
                    break;
                }
                default : {
                    if (typeof fieldValue === 'boolean') {
                        dataOfLine.push(
                            $('<td class="text-center"></td>').html(getIconFromLibrary(fieldValue ? 'check-square' : 'square'))
                        )
                    } else {
                        dataOfLine.push(
                            $('<td></td>').text(fieldValue).attr('hidden', field.hidden)
                        );
                    }
                }
            }
        }
        lines.push($('<tr></tr>').append(dataOfLine));
    }

    $('#users-table tbody')
        .empty()
        .hide()
        .append(lines)
        .show(150);

}

function getRoleCheck(roleName, arrRoleCheck) {
    for (let roleCheck of arrRoleCheck) {
        if (roleName === roleCheck.name) {
            return roleCheck.value;
        }
    }
}

function getTdInputCheckBox(value) {
    return $('<td class="text-center"></td>')
            .append($('<input className="form-check-input" type="checkbox" disabled>').attr('checked', value));
}

function getTableToolbar(id) {

    let elBtnGroup = $('<div class="btn-group  btn-group-sm" role="group"></div>')
        .append(getTableToolbarButton('edit', id))
        .append(getTableToolbarButton('delete'));

    var elTd = $('<td class="text-center"></td>').append(elBtnGroup);

    return elTd;
}

function getTableToolbarButton(type, id = '') {

    const btn = $('<button class="btn mx-1"></button>');

    switch (type) {
        case 'edit' :
        {
            btn
                .addClass('btn-outline-primary')
                .html(getIconFromLibrary('pencil'))
                .on('click', function () {openEditModal(id)});
            break;
        }
        case 'delete' :
        {
            btn
                .addClass('btn-outline-danger')
                .html(getIconFromLibrary('trash'));
            break;
        }
    }

    return btn;

}

function getIconFromLibrary(iconName) {

    switch (iconName) {

        case 'square' : {
            return '' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-square" viewBox="0 0 16 16">\n' +
                '  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>\n' +
                '</svg>';
        }

        case 'check-square' : {
            return '' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-square" viewBox="0 0 16 16">\n' +
                '  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>\n' +
                '  <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z"/>\n' +
                '</svg>';
        }

        case 'pencil' : {
            return '' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">\n' +
                '  <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>\n' +
                '</svg>';
        }

        case 'trash' : {
            return '' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">\n' +
                '  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>\n' +
                '  <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>\n' +
                '</svg>';
        }

        default : return '';
    }

}

function getRoles() {
    return [
        {
            name: "Admin",
            description: "Администратор"
        },
        {
            name: "User",
            description: "Пользователь"
        }
    ];
}

function getUsers() {

    return [
        {
            id: 0,
            name: "Ivanov 1",
            active: true,
            person: persons[0],
            roles: [
                {
                    'name': 'Admin',
                    'value': true
                },
                {
                    'name': 'User',
                    'value': true
                }
            ]
        },
        {
            id: 1,
            name: "Ivanov 2",
            active: false,
            person: persons[0],
            roles: [
                {
                    'name': 'Admin',
                    'value': false
                },
                {
                    'name': 'User',
                    'value': true
                }
            ]
        },
        {
            id: 2,
            name: "Ivanov 3",
            active: true,
            person: persons[2],
            roles: [
                {
                    'name': 'Admin',
                    'value': false
                },
                {
                    'name': 'User',
                    'value': true
                }
            ]
        },
        {
            id: 3,
            name: "Ivanov 3",
            active: true,
            person: persons[2],
            roles: [
                {
                    'name': 'Admin',
                    'value': false
                },
                {
                    'name': 'User',
                    'value': true
                }
            ]
        },
        {
            id: 4,
            name: "Ivanov 4",
            active: true,
            person: persons[1],
            roles: [
                {
                    'name': 'Admin',
                    'value': false
                },
                {
                    'name': 'User',
                    'value': true
                }
            ]
        },
        {
            id: 5,
            name: "Ivanov 5",
            active: true,
            person: persons[1],
            roles: [
                {
                    'name': 'Admin',
                    'value': false
                },
                {
                    'name': 'User',
                    'value': true
                }
            ]
        }
    ];

}

function getPersons() {
    return [
        {
            value: 1,
            label: 'Иванов',
            toString() {return this.label}
        },
        {
            value: 2,
            label: 'Петров',
            toString() {return this.label}
        },
        {
            value: 3,
            label: 'Сидоров',
            toString() {return this.label}
        }
    ]
}