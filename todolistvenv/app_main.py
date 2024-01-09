from flask              import render_template, request, redirect, flash, session, url_for, abort, jsonify
from models             import *
from werkzeug.security  import generate_password_hash, check_password_hash
import json


@app.route('/')
def index():
    
    return render_template('index.html', title = 'PlanAhead')
  
  
@app.route('/api/create', methods = ['POST', 'GET'])
def create():
    success = False
    messages = []
    
    userId = None
    
    if request.method == 'POST':
        data = request.form
        task = data.get('task')
        
        if len(task) > 0:
            if 'userLoggedId' in session:
                userId = session['userLoggedId']
            elif 'guestId' in session:
                userId = session['guestId']
            else:
                newGuest = Users(name = 'Гость')
                try:
                    db.session.add(newGuest)
                    db.session.flush()
                    db.session.commit()
                    
                    userId = newGuest.id
                    session['guestId'] = userId
                except:
                    messages.append({'message': 'Ошибка добавления пользователя!', 'category': 'error'})
            
            if userId is not None:
                newTask = Tasks(userId = userId, text = task, status = "active")

                try:
                    db.session.add(newTask)
                    db.session.commit()
                    
                    success = True
                    messages.append({'message': 'Задача успешно создана!', 'category': 'success'})
                except:
                    messages.append({'message': 'Что-то пошло не так!', 'category': 'error'})
                
    return {'success': success, 'messages': messages }


@app.route('/api/delete/<taskId>', methods = ['GET'])
def delete(taskId):
    success = False
    messages = []
        
    if request.method == 'GET':
        try:
            task = Tasks.query.get(taskId)
            db.session.delete(task)
            db.session.commit()
            
            success = True
            messages.append({'message': 'Задача успешно удалена!', 'category': 'success'})
        except:
            messages.append({'message': 'Ошибка удаления задачи!', 'category': 'error'})
                
    return {'success': success, 'messages': messages }
    
    
@app.route('/api/done/<taskId>', methods = ['GET'])
def done(taskId):
    success = False
    messages = []
        
    if request.method == 'GET':
        try:
            task = Tasks.query.get(taskId)
            task.status = 'done'
            db.session.commit()
            
            success = True
        except:
            messages.append({'message': 'Ошибка изменения статуса!', 'category': 'error'})
                
    return {'success': success, 'messages': messages }
    

@app.route('/api/edit/<taskId>', methods = ['POST', 'GET'])
def edit(taskId):
    success = False
    messages = []
        
    if request.method == 'POST':
        if 'userLoggedId' in session:
            if session['userLoggedId'] == 0:
                data = json.loads(request.data)
                try:
                    task = Tasks.query.get(taskId)
                    task.text = data['task']
                    task.edited = True
                    db.session.commit()
                    
                    success = True
                    messages.append({'message': 'Задача успешно изменена!', 'category': 'success'})
                except:
                    messages.append({'message': 'Ошибка при редактировании!', 'category': 'error'})
            else:
                messages.append({'message': 'Недостаточно прав для редактирования!', 'category': 'error'})
        else:
            messages.append({'message': 'Недостаточно прав для редактирования!', 'category': 'error'})
                
    return {'success': success, 'messages': messages }
    
 
@app.route('/api/login', methods = ['POST', 'GET']) 
def login():
    messages = []
    success = False
    
    if request.method == 'POST':
        data = json.loads(request.data)
        login = data['email']
        password = data['password']
        
        try:    
            user = Users.query.filter_by(email = login).first()
            
            if user is not None:
                
                if check_password_hash(user.password, password):
                    session['userLoggedId'] = user.id
                    session.pop('guestId', None)
                    
                    success = True
                    if login == 'admin':
                        messages.append({'message': 'Вы вошли как администратор!', 'category': 'success'})
                    else:
                        messages.append({'message': 'Вход выполнен успешно!', 'category': 'success'})
                else:
                    messages.append({'message': 'Пароль неверный!', 'category': 'error'})
            else:
                messages.append({'message': 'Такого пользователя не существует!', 'category': 'error'})
        except: 
            messages.append({'message': 'Ошибка определения пользователя!', 'category': 'error'})
        
    return {'success': success, 'messages': messages }
 
 
@app.route('/api/logout') 
def logout():
    messages = []
    success = False
    
    if 'userLoggedId' in session:
        session.pop('userLoggedId', None)
        success = True
        
    return {'success': success, 'messages': messages }
 
 
@app.route('/api/register', methods = ['POST', 'GET'])
def register():
    messages = []
    success = False
    
    if request.method == 'POST':
        data = json.loads(request.data)
        try:
            hash = generate_password_hash(data['password'])
            newUser = Users(name = data['name'], email = data['email'], password = hash)
            db.session.add(newUser)
            db.session.flush()
            
            db.session.commit()
            
            session['userLoggedId'] = newUser.id
            session.pop('guestId', None)
            
            success = True
            messages.append({'message': 'Вы успешно зарегистрировались!', 'category': 'success'})
        except:
            db.session.rollback()
            messages.append({'message': 'Ошибка добавления нового пользователя!', 'category': 'error'})
        
    return {'success': success, 'messages': messages }
 
 
@app.route('/api/getData')
def getData():
    userData                = ''
    tasks                   = []
    messages                = []
    
    userId                  = None
    
    if 'userLoggedId' in session:
        userId              = session.get('userLoggedId')
        
        if userId == 0:
            userData        = {'name': 'admin'}
        else:
            try:
                user        = Users.query.get(userId)
                userData    = user.serialize()
            except:
                messages.append({'message': 'Ошибка получения данных пользователя!', 'category': 'error'})
                
    elif 'guestId' in session:
        userId              = session.get('guestId')
    
    if userId is not None:
        try:
            if userId == 0:
                tasks       = db.session.query(Tasks, Users).join(Users, Users.id == Tasks.userId).all()
            else:
                tasks       = db.session.query(Tasks, Users).join(Users, Users.id == Tasks.userId).filter(Tasks.userId == userId).all()
            
        except:
            messages.append({'message': 'Ошибка чтения из базы данных!', 'category': 'error'})
    
    return {'userData': userData, 'tasks': list(dict(map(lambda item: (item[0], item[1].serialize()), task._asdict().items())) for task in tasks), 'messages': messages }


def registerAdmin():
    hash = generate_password_hash("123")
    newUser = Users(name = "admin", email = "admin", password = hash)
    newUser.id = 0
    db.session.add(newUser)
    db.session.flush()
    
    db.session.commit()
    
    
@app.errorhandler(404)
def pageNotFound(error):
    return render_template('page404.html', title = 'Страница не найдена!'), 404


if __name__ == '__main__':
    app.run(debug = True)
