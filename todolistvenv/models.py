from datetime           import datetime
from flask              import Flask
from flask_sqlalchemy   import SQLAlchemy

import settings

app = Flask(settings.APP_FILE)
app.config.from_object(settings)

db  = SQLAlchemy(app)
    
class Users(db.Model):
    id          = db.Column(db.Integer, primary_key = True)
    name        = db.Column(db.String(250), nullable = False)
    email       = db.Column(db.String(250), nullable = True, unique = True)
    password    = db.Column(db.String(500), nullable = True)
    date        = db.Column(db.DateTime, default = datetime.utcnow)
    tasks       = db.relationship('Tasks')
    
    def __repr__(self):
        return f'<Users {self.name}: {self.email}>'
        
    def serialize(self):
        return {'id': self.id, 'name': self.name, 'email': self.email}

class Tasks(db.Model):
    id          = db.Column(db.Integer, primary_key = True)
    text        = db.Column(db.Text, nullable = False)
    status      = db.Column(db.String(250), nullable = False)
    edited      = db.Column(db.Boolean, default = False)
    userId      = db.Column(db.Integer, db.ForeignKey('users.id'))
    date        = db.Column(db.DateTime, default = datetime.utcnow)
    
    def __repr__(self):
        return f'<Tasks {self.text}: {self.status}>'
        
    def serialize(self):
        return {'id': self.id, 'text': self.text, 'status': self.status, 'edited': self.edited, 'date': self.date}