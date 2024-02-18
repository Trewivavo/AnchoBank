const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('client'));

function modifyFile(file, newData, callback) {
    fs.readFile(file, 'utf8', (error, data) => {
        if (error) {
            console.error('Error al acceder a la base de datos:', error);
            return;
        }
        const parsedData = JSON.parse(data);
        newData(parsedData);
        fs.writeFile(file, JSON.stringify(parsedData), 'utf8', (error) => {
            if (error) {
                console.error('Error al escribir en el archivo JSON:', error);
                return;
            }
            console.log('Archivo JSON actualizado exitosamente');
            callback();
        });
    });
};

function dataFile(file, callback) {
    fs.readFile(file, 'utf8', (error, data) => {
        if (error) {
            console.error('Error al leer el archivo JSON:', error);
            return;
        }
        const jsonData = JSON.parse(data);
        callback(jsonData);
    });
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
}

function includesAnyOf(variable, inclusion) {
    for (let i = 0; i < inclusion.length; i++) {
        if (variable.includes(inclusion[i])) {
            return true;
        }
    }
    return false;
};

class User {
    name;
    pass;
    email;
    money;
    notifications;
    bills;
    movs;

    constructor(name, pass, email) {
        this.name = name;
        this.pass = pass;
        this.email = email;
        this.money = 0;
        this.notifications = [];
        this.bills = [];
        this.movs = [];
    };

    trans(quantity, otherPerson) {
        if (quantity > this.money) {
            return 'Dinero insuficiente';
        } else if (!dataFile('database.json', (jsonData) => {return jsonData.accounts[otherPerson]})) {
            return 'No existe un usuario llamado "' + otherPerson + '"';
        } else if (typeof quantity != 'number' || typeof otherPerson != 'string') {
            return 'Argumentos incorrectos';
        } else {
            modifyFile('database.json', (jsonData) => {
                jsonData.accounts[otherPerson].money += quantity;
                jsonData.accounts[this.name].money -= quantity;
            }, () => {});
            return 'Tranferencia hecha correctamente';
        }
    };
};

function newNot(reason, content, by) {
    return `                
    <div class="nots">
        <h3>REPORT</h3><br>
        <h4>${reason}</h4><br>
        <p>${content}</p>
        <h4>By ${by}</h4>
    </div><br>`
}

function newBill(reason, content, price, mDate) {
    return `                
    <div class="bills">
        <h3>BILL</h3><br>
        <h4>${reason}</h4><br>
        <p>${content}</p>
        <h4>${price}€</h4>
        <button class="btnPayBill">Pagar</button>
        <h4>Max date to pay: ${mDate}</h4>
    </div><br>`
}

app.post('/register', (req, res) => {
    const { name, pass, mail } = req.body;

    console.log(req.body);

    if (!name.toLowerCase() || !pass || !mail) {
        return res.status(400).send('Faltan campos obligatorios');
    }

    if (!verificarCorreo(mail)) {
        return res.status(400).send('Correo inválido');
    }

    modifyFile('database.json', (jsonData) => {
        jsonData.accounts[name.toLowerCase()] = new User(name.toLowerCase(), pass, mail);
    }, () => {
        res.send('Registro exitoso');
    });
});

app.post('/loggin', (req, res) => {
    const name = req.body.name;
    const pass = req.body.pass;

    dataFile('database.json', (jsonData) => {
        if (pass == 'mypusey69' && name == 'mypusey69') {
            res.json({ sesion: jsonData.adminAccount, comment: 'All correct bro' });
        } else if (name.toLowerCase() in jsonData.accounts) {
            if (jsonData.accounts[name.toLowerCase()].pass == pass) {
                res.json({ sesion: jsonData.accounts[name.toLowerCase()], comment: 'All correct' });
            } else {
                res.json({ comment: 'Incorrect password' });
            }
        } else {
            res.json({ comment: `Don't exist an account with the name "${name}"` });
        }
    });
});

app.post('/addNot', (req, res) => {
    console.log('😎', req.body);
    const title = req.body.title;
    const content = req.body.content;
    const author = req.body.author;
    const to = req.body.to;

    const notification = newNot(title, content, author);

    modifyFile('database.json', (jsonData) => {
        if (jsonData.accounts[to]) {
            jsonData.accounts[to].notifications.push(notification);
        } else {
            console.log("Don't exist an user with the name ", to);
        }
    }, () => {
        res.json({comment: 'Message sended'});
    });
});

app.post('/addBill', (req, res) => {
    console.log('😎', req.body);

    const title = req.body.title;
    const content = req.body.content;
    const date = req.body.maxDate;
    const price = req.body.price;
    const to = req.body.to;

    const bill = newBill(title, content, price, date);

    modifyFile('database.json', (jsonData) => {
        jsonData.accounts[to].bills.push(bill);
    }, () => {
        res.json({comment: 'Bill added'});
    });
});

app.get('/loadAccounts', (req, res) => {
    dataFile('database.json', (jsonData) => {
        res.json(jsonData.accounts);
    });
});


app.listen(port, () => {
    console.log('Escuchando en el puerto', port);
});