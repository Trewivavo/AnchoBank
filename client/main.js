//Declarations
const mainDiv = document.getElementById('mainDiv');
let sesion = {};

const htmls = {
    loggin: `
    <header>
        <h1>🏦 Ancho Bank 🏦</h1>
        <h3> - Taking care of you money - </h3>
    </header>

    <main id="logginBody">
        <h1>LOGIN</h1>
        <form id="logginForm">
            <br>
            <label for="nameLoggin">Username</label>
            <input type="text" id="nameLoggin" name="nameLoggin" placeholder="username">
            <br>
            <br>
            <label for="passLoggin">Password</label>
            <input type="text" id="passLoggin" name="passLoggin" placeholder="password">
            <br>
            <br>
            <button id="btnLogin" type="submit">Loggin</button>
            <br>
            or
            <br>
            <button id="alternateL">You already have an account?</button>
        </form>
    </main>
    `,
    register: `
    <header>
        <h1>🏦 Ancho Bank 🏦</h1>
        <h3> - Taking care of you money - </h3>
    </header>

    <main id="registerBody">
        <h1>REGISTER</h1>
        <form id="registerForm">
            <br>
            <label for="nameRegister">Username</label>
            <input type="text" id="nameRegister" name="nameRegister" placeholder="username">
            <br>
            <br>
            <label for="passRegister">Password</label>
            <input type="text" id="passRegister" name="passRegister" placeholder="password">
            <br>
            <br>
            <label for="mailRegister">e-mail</label>
            <input type="text" id="mailRegister" name="mailRegister" placeholder="e mail">
            <br>
            <br>
            <button id="btnRegister" type="submit">Register</button>
            <br>
            or
            <br>
            <button id="alternateR">You already have an account?</button>
        </form>
    </main>
    `,
    newMain: function(sesion) {
        return `
        <header>
            <h1>🏦 Ancho Bank 🏦</h1>
            <h3>My Profile</h3>
            <button id="btnNotPage">My inbox</button>
        </header>

        <main id="mainUserBody">
            <h1>Welcome, ${sesion.name}</h1>
            <h2>Your money: ${sesion.money}€</h2>
            <div id="mainUserBodyDiv1"></div>

            <div id="transPanel">
                <h3>Transfer</h3>
                <form></form>
            </div>
        </main>
        `;
    },
    customHeader: function(m) {
        return `    
        <header>
            <h1>🏦 Ancho Bank 🏦</h1>
            <h3>${m}</h3>
        </header>
        `;
    },
    notsPage: function (sesion) {
        return `
        <header>
            <h1>🏦 Ancho Bank 🏦</h1>
            <h3>${sesion.name}'s inbox</h3>
            <button id="btnBack">Back</button>
        </header>

        <main>
            <h2>BILLS</h2>
            <div id="billDiv"></div>
            <h2>OTHER NOTIFICATIONS</h2>
            <div id="notDiv"></div>
        </main>
        `;
    }
};

function withNewPath(newPath) {
    const url = window.location.href;
    const lastSlash = url.lastIndexOf('/');
    
    if (lastSlash !== -1) {
        const primeraParte = url.substring(0, lastSlash);
        if (primeraParte.endsWith('/')) {
            return `${primeraParte}${newPath}`;
        } else {
            return `${primeraParte}/${newPath}`;
        }
    } else {
        return `${url}/${newPath}`;
    }
};

function includesAnyOf(variable, inclusion) {
    for (let i = 0; i < inclusion.length; i++) {
        if (variable.includes(inclusion[i])) {
            return true;
        }
    }
    return false;
};

function verificarCorreo(mail) {
    const caracteresNoPermitidos = [' ', '!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '`', '{', '|', '}', '~'];

    if (mail.includes('@')) {
        [ parte1, parte2 ] = mail.split('@');
        if (parte1.includes('@') || parte2.includes('@')) {
            return false;
        } else if (parte2.includes('.')) {
            [ parte21, parte22 ] = parte2.split('.')
            if (parte21.includes('.') || parte22.includes('.') || parte1.includes('.')) {
                return false;
            } else if (includesAnyOf(parte1, caracteresNoPermitidos) || includesAnyOf(parte21, caracteresNoPermitidos) || includesAnyOf(parte22, caracteresNoPermitidos)) {
                return false;
            } else if (parte22.length < 2 || parte1.length < 1 || parte21.length < 1) {
                return false;
            } else {
                return true;
            }
        }
    }
};

function loadAllClient(sesion, div) {
    sesion.bills.forEach(bill => {
        div.innerHTML += bill;
    });
    sesion.notifications.forEach(noti => {
        div.innerHTML += noti;
    });
};

function loadAllAdmin(div) {
    fetch(withNewPath('loadAccounts'))
        .then(response => response.json())
        .then(data => {
            if (typeof data == 'object') {
                const keys = Object.keys(data);

                keys.forEach(key => {
                    div.innerHTML += htmls.customHeader('Administrator mode');
                    div.innerHTML += `<h1>${keys.length} users in this moment</h1>`;
                    div.innerHTML += `<h2>Data of ${data[key].name} (${data[key].email}):</h2>`;
                    div.innerHTML += `<h3>Money: ${data[key].money}€</h3>`;
                    div.innerHTML += `<h3>Notifications:</h3>`;
                    data[key].notifications.forEach(noti => {div.innerHTML += noti});
                    div.innerHTML += `<h3>Bills:</h3>`;
                    data[key].bills.forEach(bill => {div.innerHTML += bill});
                    div.innerHTML += `<button id="${data[key].name}NewNot">add message</button><br>`;
                    div.innerHTML += `<button id="${data[key].name}NewBill">add bill</button><br>`;
                    div.innerHTML += `<button id="${data[key].name}UncorrectMail">Unvalide mail</button><br>`;
                });
            }
        })
};
  

//At the start

mainDiv.innerHTML = htmls.loggin;

//Async events

    //Click type
mainDiv.addEventListener('click', (event) => {
    if (event.target.id == 'alternateR') {
        mainDiv.innerHTML = htmls.loggin;
    } else if (event.target.id == 'alternateL') {
        mainDiv.innerHTML = htmls.register;
    } else if (event.target.id.endsWith('NewNot') && sesion.admin) {
        mainDiv.innerHTML = `
        <button id="btnBack">Back</button><br>
        <h1>Enviar mensaje a ${event.target.id.replace('NewNot', '')}</h1><br>
        <input type="text" id="inputTitleNot" placeholder="Title"><br>
        <textarea id="textareaNot" rows="4" cols="50"></textarea><br>
        By <input type="text" id="inputAuthorNot" placeholder="Author">
        <button id="${event.target.id.replace('NewNot', '')}AddNot">Send message</button>
        `;
    } else if (event.target.id.endsWith('NewBill') && sesion.admin) {
        mainDiv.innerHTML = `
        <button id="btnBack">Back</button><br>
        <h1>Añadir factura a ${event.target.id.replace('NewBill', '')}</h1><br>
        <input type="text" id="inputTitleBill" placeholder="Title"><br>
        <textarea id="textareaBill" rows="4" cols="50"></textarea><br>
        max date: <input type="text" id="inputDateBill" placeholder="Max date to pay"><br>
        Price <input type="text" id="inputPriceBill" placeholder="Price">€
        <button id="${event.target.id.replace('NewBill', '')}AddBill">Add bill</button>
        `;
    } else if (event.target.id == 'btnBack' && sesion.admin) {
        mainDiv.innerHTML = '';
        loadAllAdmin(mainDiv);
    } else if (event.target.id == 'btnBack' && !sesion.admin) {
        mainDiv.innerHTML = htmls.newMain(sesion);
    } else if (event.target.id.endsWith('AddNot')) {
        fetch(withNewPath('addNot'), {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({title: document.getElementById('inputTitleNot').value, content: document.getElementById('textareaNot').value, author: document.getElementById('inputAuthorNot').value, to: event.target.id.replace('AddNot', '')})
        })
            .then(response => response.json())
            .then(data => {
                if (data.comment) {
                    alert(data.comment);
                } else {
                    console.log(data);
                }
            })
            .catch(error => console.log('Error desde /addNot', error));
    } else if (event.target.id.endsWith('AddBill')) {
        fetch(withNewPath('addBill'), {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({title: document.getElementById('inputTitleBill').value, content: document.getElementById('textareaBill').value, maxDate: document.getElementById('inputDateBill').value, price: parseInt(document.getElementById('inputPriceBill').value), to: event.target.id.replace('AddBill', '')})
        })
        .then(response => response.json())
        .then(data => {
            if (data.comment) {
                alert(data.comment);
            } else {
                console.log(data);
            }
        })
        .catch(error => console.log('Error desde /addBill', error));
    } else if (event.target.id == 'btnNotPage') {
        mainDiv.innerHTML = htmls.notsPage(sesion);
        if (document.getElementById('billDiv') && document.getElementById('notDiv')) {
            if (sesion.bills[0]) {
                sesion.bills.forEach(bill => {
                        document.getElementById('billDiv').innerHTML += bill;
                });
            } else {
                document.getElementById('billDiv').innerHTML = `<h3>You don't have any pending invoices. How do you do it?</h3>`;
            }
            if (sesion.notifications[0]) {
                sesion.notifications.forEach(not => {
                    document.getElementById('notDiv').innerHTML += not;
                });
            } else {
                document.getElementById('notDiv').innerHTML = `<h3>You are up to date!</h3>`;
            }
        } else {
            console.log('Divs inexistentes');
        }
    }
});

mainDiv.addEventListener('submit', (event) => {
    event.preventDefault();
    if (event.target.id == 'registerForm') {
        if (verificarCorreo(document.getElementById('mailRegister').value)) {
            fetch(withNewPath('register'), {
                method: 'POST',
                headers: {'Content-Type': 'application/json'}, // Indica que el contenido del cuerpo es JSON
                body: JSON.stringify({ // Convierte el objeto a formato JSON
                    name: document.getElementById('nameRegister').value,
                    pass: document.getElementById('passRegister').value,
                    mail: document.getElementById('mailRegister').value
                })
            })
                .then(response => response.text())
                .then(data => alert(data))
                .catch(error => console.log('Error desde /register: ', error));
        } else {
            alert('Correo inválido');
        }
    } else if (event.target.id == 'logginForm') {
        fetch(withNewPath('loggin'), {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}, // Indica que el contenido del cuerpo es JSON
            body: JSON.stringify({ // Convierte el objeto a formato JSON
                name: document.getElementById('nameLoggin').value,
                pass: document.getElementById('passLoggin').value,
            })
        })
            .then(response => response.json())
            .then(data => {
                if (!data.comment) {
                    console.log(data);
                } else if (!data.sesion) {
                    alert(data.comment);
                } else {
                    sesion = data.sesion;
                    console.log(data.comment)
                    if (sesion.admin) {
                        mainDiv.innerHTML = htmls.adminInterface;
                        loadAllAdmin(mainDiv);
                    } else {
                        mainDiv.innerHTML = htmls.newMain(sesion);
                    }
                }
            })
            .catch(error => console.log('Error desde /loggin: ', error));
    }
});

// mainDiv.innerHTML = htmls.newMain({name:'Pepito', money:0, notifications:['Buenos dias, le recordamos que so', '<h2>Me pica la pollica</h2>'], bills:['<h1>Pene</h1>']}); //Esta línea esta para desarrollar la página principal con mayor comodidad, pero en cuanto los estilos estén listos será removida