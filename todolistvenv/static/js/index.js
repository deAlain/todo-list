
const main_container = ReactDOM.createRoot(document.getElementById("main-container"))

const CommonContext = React.createContext(undefined);

class App extends React.Component{
	constructor(props){
		super(props)
		this.state = {
			errors: 		null,
			userData: 		'',
			tasks: 			[],
			messages: 		[],
			body: 			<TodolistContainer />,
			currentPage: 	1,
			tasksPerPage:	3,
		}
		
		this.showAuthForm 	= this.showAuthForm.bind(this)
		this.getMessages 	= this.getMessages.bind(this)
		this.getData 		= this.getData.bind(this)
		this.setCurrentPage = this.setCurrentPage.bind(this)
		this.sortTasks 		= this.sortTasks.bind(this)
	}
	
	showAuthForm(authForm){
		this.setState({ body: <AuthenticationForm authForm = { authForm } /> })
	}
	
	getMessages(messages){
		this.setState({ messages: messages })
		setTimeout(() => {  this.setState({ messages: [] }) }, 2000)
	}
	
	setCurrentPage(pageNumber){
		this.setState({ 
			currentPage: 	pageNumber
		})
	}
	
	getSortingField(element, field){
		switch (field) {
			case 'userName':
				return element.Users.name + " " + element.Users.id
				break
			case 'userEmail':
				return element.Users.email || ""
				break
			case 'taskStatus':
				return element.Tasks.status
				break
		}
	}
	
	sortTasks(field, order){
		
		if (field == "default"){
			return
		}
		
		const tasksCopy = this.state.tasks.sort((a, b) => {
			
			let aValue = this.getSortingField(a, field)
			let bValue = this.getSortingField(b, field)
				
			if (order == 'desc'){
				
				aValue = this.getSortingField(b, field)
				bValue = this.getSortingField(a, field)
			}
			
			if (aValue.toLowerCase() < bValue.toLowerCase()) {
				return -1
			}
			if (aValue.toLowerCase() > bValue.toLowerCase()) {
				return 1
			}
				return 0
		})
		
		this.setState({ tasks: tasksCopy })
	}
		
	getData(){
		fetch('/api/getData').then(result => result.json()).then(
			(result) => {
				let copy 				= Object.assign([], this.state.messages)
				result.messages.map((message) => copy.push(message))
								
				this.setState({ 
					userData: 			result.userData, 
					tasks: 				result.tasks, 
					messages: 			copy, 
					body: 				<TodolistContainer />,
				})
				this.setCurrentPage(this.state.currentPage)
			},
			(error) => this.setState({ error })
		)
	}
	
	componentDidMount(){
		this.getData()
	}
	
	render(){
		return(
			<div className = "container-fluid">
				<CommonContext.Provider value = {{ 
					state: 			this.state, 
					showAuthForm: 	this.showAuthForm, 
					getData: 		this.getData, 
					getMessages: 	this.getMessages,
					setCurrentPage: this.setCurrentPage,
					sortTasks:		this.sortTasks
				}}>
					<Header />
					<Popup />
					{ this.state.body }
					<Footer />
				</CommonContext.Provider>
			</div>
		)
	}
}

function Header(props){
	
	const value 	= React.useContext(CommonContext)
	
	const states 	= {
		'userGuestState': {
			'left': <LoginButton />, 
			'right': <RegisterButton />
		},
		'userLoggedState': {
			'left': <UserNameButton />, 
			'right': <LogoutButton />
		}
	}
	
	const userState 		= value.state.userData.hasOwnProperty('name')? 'userLoggedState' : 'userGuestState'
	const currentAuthState 	= states[userState]
	
	return(
		<div className = "container">
			<div className = "row flex-nowrap border-bottom">
				<div className = "col-1"></div>
				<div className = "col-3">
					<div className = "card logo justify-content-center">
						<p className = "brandName"><a href = "/" className = "fw-bold text-body">PlanAhead</a></p>
					</div>
				</div>
				<div className = "col-5">
					<div className = "card cite justify-content-center">
						<div className = "text-muted">
							<b>При подготовке к сражению я всегда находил, что планы бесполезны, но планирование — обязательно.</b><br/>
							<cite>Дуайт Эйзенхауэр</cite>
						</div>
					</div>
				</div>
				<div className = "card col-3 justify-content-center text-right login-register">
					<div className="input-group">
						{ currentAuthState['left'] }
						{ currentAuthState['right'] }
					</div>
				</div>
			</div>
		</div>
	)
}


function LoginButton(props){
		
	const value = React.useContext(CommonContext)
	
	return (
		<button onClick = { () => value.showAuthForm(<LoginForm />) } className = "btn btn-outline-secondary gradient-custom-4" type = "submit">
			Войти
		</button>
	)
}


function RegisterButton(props){
		
	const value = React.useContext(CommonContext)
	
	return (
		<button onClick = { () => value.showAuthForm(<RegisterForm />) } className = "btn btn-outline-secondary gradient-custom-4" type = "submit">
			Зарегистрироваться
		</button>
	)
}


function LogoutButton(props){
		
	const value = React.useContext(CommonContext)
	
	function logout(){
		fetch('/api/logout')
			.then(result => result.json())
			.then((result) => value.getData())
	}
	
	return (
		<button onClick = { logout } className = "btn btn-outline-secondary gradient-custom-4" type = "submit">
			Выйти
		</button>
	)
}


function UserNameButton(props){
		
	const value = React.useContext(CommonContext)
	
	return (
		<button className = "btn btn-outline-secondary">
			{ value.state.userData.name }
		</button>
	)
}

class Footer extends React.Component{
	constructor(props){
		super(props)
		this.state = {}
	}
	
	render(){		
		return(
			<div className = "container">
				<footer className = "py-3 my-4">
					<p className = "text-center text-muted">
						&copy; 2023 PlanAhead 
						<a href="mailto:lauramia.011@gmail.com, evaleyla_@gmail.com" className = "fw-bold"> lauramia.011@gmail.com</a>
					</p>
				</footer>
			</div>
		)
	}
}

class TodolistContainer extends React.Component{
	constructor(props){
		super(props)
		this.state = {
		}
	}
	
	render(){
		return (
			<div className = "container-fluid body" style = {{ height: (window.screen.availHeight - 350) + 'px' }}>
				<div className = "row">
					<div className = "col-1"></div>
					<div className = "col-10">
						<AddNewTaskInput />
						<Sorting />
						<TodoList />
						<Pagination />
					</div>
					<div className = "col-1"></div>
				</div>
			</div>
		)
	}
}

function AddNewTaskInput(props){
	
	const value 	= React.useContext(CommonContext)
	
	const taskRef 	= React.useRef()
	
	function handleSubmit(event){
		event.preventDefault()
		const formData = new FormData(event.target)

		fetch('/api/create', { method: 'POST', body: formData })
			.then(result => result.json())
			.then((result) => {
				if (result.success == true)
					{ value.getData() }
				
				value.getMessages(result.messages)}
			)
		taskRef.current.value = ''
	}
	
	return (
		<form onSubmit = { handleSubmit }>
			<div className = "input-group form-outline mb-3">
				<input type = "text" name = "task" ref = { taskRef } className = "form-control" placeholder = "Новая задача..." />
				<button className = "btn btn-outline-secondary gradient-custom-4" type = "submit" id = "button-addon2">Добавить</button>
			</div>
		</form>
	)
}

function TodoList(props){

	const value 			= React.useContext(CommonContext)
	
	const tasksPerPage		= value.state.tasksPerPage
	
	const lastTaskIndex 	= value.state.currentPage * tasksPerPage
	const firstTaskIndex 	= lastTaskIndex - tasksPerPage
	
	const currentTasks		= value.state.tasks.slice(firstTaskIndex, lastTaskIndex)
	
	return (
		<div className="row flex-nowrap todolist">
			{ currentTasks.map((task, index) => <Task key = { index } task = { task } />) }
		</div>
	)
}

function Sorting(props){

	const value 	= React.useContext(CommonContext)
	const fieldsRef = React.useRef()
	const orderRef 	= React.useRef()
	
	const tasks 	= value.state.tasks
	
	function onSelect(event){
		const sortingField = fieldsRef.current.value
		const sortingOrder = orderRef.current.value
		
		value.sortTasks(sortingField, sortingOrder)
	}
	
	return (
		<div className = "input-group form-outline mb-3" style = {{ display: tasks.length > 0? 'block' : 'none' }}>
			<div className = "input-group mb-3">
			  <select name = "fields" ref = { fieldsRef } onChange = { (e) => onSelect(e) } defaultValue = "default" className = "form-select" >
				<option value = "default">Сортировать по...</option>
				<option value = "userName">Имя пользователя</option>
				<option value = "userEmail">Email пользователя</option>
				<option value = "taskStatus">Статус задачи</option>
			  </select>
			  <select name = "order" ref = { orderRef } onChange = { (e) => onSelect(e) } defaultValue = "asc" className = "form-select">
				<option value = "asc">По возрастанию</option>
				<option value = "desc">По убыванию</option>
			  </select>
			</div>
		</div>
	)
}

function Pagination(props){
	
	const value 			= React.useContext(CommonContext)
	
	const pages 			= []
	const tasksPerPage		= value.state.tasksPerPage
	const currentPage		= value.state.currentPage
	
	const totalTasks 		= value.state.tasks.length
	
	for (let i = 1; i <= Math.ceil(totalTasks / tasksPerPage); i++){
		pages.push(i)
	}
	
	function getPage(pageNumber){
		value.setCurrentPage(pageNumber)
	}
	
	return (
		<nav style = {{ display: totalTasks > 0? 'block' : 'none'}}>
			<ul className = "pagination pagination-sm justify-content-center">
				<li className = "page-item">
					<a onClick = { () => getPage(currentPage - 1) } className = { "page-link " + (currentPage == 1? 'disabled' : '') } href = "#">Предыдущая</a>
				</li>
				{ pages.map((pageNumber, index) => 
					<li key = { index } className = { "page-item " + (currentPage == pageNumber? 'active' : '') } >
						<a onClick = { () => getPage(pageNumber) } className = "page-link" href = "#">{ pageNumber }</a>
					</li>
				)}
				<li className = "page-item">
					<a onClick = { () => getPage(currentPage + 1) } className = { "page-link " + (currentPage == pages.length? 'disabled' : '') } href = "#">Следующая</a>
				</li>
			</ul>
		</nav>
	)
}

function Popup(props){
	const value 		= React.useContext(CommonContext)
	const messages 		= value.state.messages
	
	const messageStyle 	= {
		'error': 	'text-danger',
		'success': 	'text-success'
	}
	
	return (
		<div className = "modal" tabIndex = "-1" style = {{ display: messages.length > 0? 'block' : 'none' }}>
			<div className = "modal-dialog">
				<div className = "modal-content">
				  <div className = "modal-body">
					{ messages.map((message, index) => <h5 key = { index } className = { messageStyle[message.category] }>{ message.message }</h5>) }
				  </div>
				</div>
			</div>
		</div>
	)
}

function Task(props){
	
	const value 					= React.useContext(CommonContext)

	const task 						= props.task.Tasks
	const user 						= props.task.Users
	const userName 					= user.name != "Гость"? user.name : user.name + " " + user.id
	
	const [taskText, setTaskText] 	= React.useState(task.text)
	const [editable, setEditable] 	= React.useState(false)
	
	React.useEffect(() => {
		setTaskText(task.text)
	})
	
	const taskStatus 				= {
		'active': 	{'statusText': 	'АКТИВНО', 'cardStyle': 'border-success text-success', 'statusStyle': 'bg-success'},
		'done': 	{'statusText': 	'ВЫПОЛНЕНО', 'cardStyle': 'border-light text-secondary', 'statusStyle': ''}
	}
	
	function handleChange(event){
		task.text = event.target.value
		setTaskText(task.text)
	}
	
	function handleSubmit(data){
		const formData = JSON.stringify(data)
		
		fetch('/api/edit/' + task.id, { method: 'POST', body: formData })
			.then(result => result.json())
			.then((result) => {
				if (result.success == true)
					{ value.getData() }
				
				value.getMessages(result.messages)}
			)
	}
	
	function checkAdmin(){
		const userData = value.state.userData
			
		if (userData.hasOwnProperty('name')){
			return userData.name == 'admin'? true : false
		}
	}
	
	function onClick(){
		if (checkAdmin()){
			if (!editable){
				setEditable(true)
			}
		}
	}
		
	function onBlur(){
		if (checkAdmin()){
			if (editable){
				handleSubmit({'task': taskText})
				
				setEditable(false)
			}
		}
	}
	
	return (
		<div className = "col-4">
			<div className = { "card card-block justify-content-center text-center " + taskStatus[task.status]['cardStyle'] }>
				<div className = "card-header text-right">
					<span className = "badge bg-warning">{ task.edited? 'Изменено администратором' : '' }</span>
					<span className = { "badge " + taskStatus[task.status]['statusStyle'] }>{ taskStatus[task.status]['statusText'] }</span>
				</div>
				<div className = "card-body">
					<h3 className = "card-title">{ userName }</h3>
					<p onClick = { onClick } style = {{ display: !editable? 'block' : 'none' }} className = "card-text">{ taskText }</p>
					<form style = {{ display: editable? 'block' : 'none' }}>
						<input type = "text" name = "task" value = { taskText } onChange = { handleChange } onBlur = { onBlur } className = "form-control border-0" />
					</form>
				</div>
				<div className = "card-footer text-muted text-center">
					<DoneButton taskId = { task.id } statusState = { task.status } />
					<DeleteButton taskId = { task.id } />
				</div>
				<div className = "card-footer text-muted">{ task.date }</div>
			</div>
		</div>
	)
}

function DoneButton(props){
	
	const states 		= {
		'active': 	{'action': () => Done(props.taskId), 'active': 'gradient-custom-4'}, 
		'done': 	{'action': () => {}, 'active': 'disabled'}, 
	}
	const taskStatus 	= props.statusState
		
	const value 		= React.useContext(CommonContext)
	
	function Done(taskId){
		fetch('/api/done/' + taskId, { method: 'GET' })
			.then(result => result.json())
			.then((result) => {
				if (result.success == true)
					{ value.getData() }
				
				value.getMessages(result.messages)}
			)
	}
	
	const currentState 	= states[taskStatus]
		
	return (
		<button onClick = { currentState.action } className = { "btn btn-outline-secondary " + currentState.active } type = "submit">
			Выполнено
		</button>
	)
}

function DeleteButton(props){
		
	const value = React.useContext(CommonContext)
	
	function DeleteTask(taskId){
		fetch('/api/delete/' + taskId, { method: 'GET' })
			.then(result => result.json())
			.then((result) => {
				if (result.success == true)
					{ value.getData() }
				
				value.getMessages(result.messages)}
			)
	}
		
	return (
		<button onClick = { () => { DeleteTask(props.taskId) } } className = "btn btn-outline-secondary gradient-custom-4" type = "submit">
			Удалить
		</button>
	)
}

function AuthenticationForm(props){
	
	const authForm = props.authForm
	
	return (
		<section className = "bg-image" style = {{ backgroundImage: "url('https://mdbcdn.b-cdn.net/img/Photos/new-templates/search-box/img4.webp')", height: (window.screen.availHeight - 300) + 'px' }}>
		  <div className = "mask d-flex align-items-center h-100 gradient-custom-3">
			<div className = "container h-100">
			  <div className = "row d-flex justify-content-center align-items-center h-100">
				<div className = "col-12 col-md-9 col-lg-7 col-xl-6">
				  <div className = "card" style = {{ borderRadius: "15px" }}>
					{ authForm }
				  </div>
				</div>
			  </div>
			</div>
		  </div>
		</section>
	)
}

function RegisterForm(props){
	
	const {
		register,
		watch,
		formState: {errors, isValid},
		handleSubmit,
		reset
	} 				= ReactHookForm.useForm({ mode: "onBlur" })
	
	const value 	= React.useContext(CommonContext)
	
	const onSubmit 	= (data) => {
		const formData = JSON.stringify(data)

		fetch('/api/register', { method: 'POST', body: formData })
			.then(result => result.json())
			.then((result) => {
				if (result.success == true)
					{ value.getData() }
				
				value.getMessages(result.messages)}
			)
		reset()
	}
		
	return (
		<div className = "card-body p-5">
		  <h2 className = "text-uppercase text-center mb-5">Регистрация</h2>
		  <form onSubmit = { handleSubmit(onSubmit) }>
			<div className = "form-outline mb-4">
			  <input type = "text" className = "form-control form-control-lg" placeholder = "Name..."
				{ ...register("name", { 
					required: "Поле обязательно для заполнения",
					validate: (val) => { if (val.toLowerCase() == "гость") { return "Недопустимое имя пользователя" }}}) 
				} />
			  <label className = "form-label text-danger">{ errors?.name && errors?.name?.message }</label>
			</div>
			<div className = "form-outline mb-4">
			  <input type = "email" className = "form-control form-control-lg" placeholder = "Email..."
				{ ...register("email", { 
					required: "Поле обязательно для заполнения",
					pattern: { value: /\S+@\S+\.\S+/, message: "Поле не соответствует формату email" }}) 
				} />
			  <label className = "form-label text-danger">{ errors?.email && errors?.email?.message }</label>
			</div>
			<div className = "form-outline mb-4">
			  <input type = "password" className = "form-control form-control-lg" placeholder = "Password..." 
				{ ...register("password", { 
					required: "Поле обязательно для заполнения" }) 
				} />
			  <label className = "form-label text-danger">{ errors?.password && errors?.password?.message }</label>
			</div>
			<div className = "form-outline mb-4">
			  <input type = "password" className = "form-control form-control-lg" placeholder = "Confirm password..." 
				{ ...register("confirmPassword", { 
					required: "Поле обязательно для заполнения", 
					validate: (val) => { if (watch('password') != val) { return "Пароли не совпадают" }}, }) 
				} />
			  <label className = "form-label text-danger">{ errors?.confirmPassword && errors?.confirmPassword?.message }</label>
			</div>
			<div className = "d-flex justify-content-center">
			  <button type = "submit" disabled = { !isValid } className = "btn btn-success btn-block btn-lg gradient-custom-4 text-body">Зарегистрироваться</button>
			</div>
		  </form>
		</div>
	)
}

function LoginForm(props){
	
	const {
		register,
		formState: {errors, isValid},
		handleSubmit,
		reset
	} 				= ReactHookForm.useForm({ mode: "onBlur" })
	
	const value 	= React.useContext(CommonContext)
	
	const onSubmit 	= (data) => {
		const formData = JSON.stringify(data)

		fetch('/api/login', { method: 'POST', body: formData })
			.then(result => result.json())
			.then((result) => {
				if (result.success == true)
					{ value.getData() }
				
				value.getMessages(result.messages)}
			)
		reset()
	}
			
	return (
		<div className	=	"card-body p-5">
		  <h2 className	=	"text-uppercase text-center mb-5">Вход</h2>
		  <form onSubmit = { handleSubmit(onSubmit) }>
			<div className = "form-outline mb-4">
			  <input type = "text" className = "form-control form-control-lg" placeholder = "Login..." 
				{ ...register("email", { 
					required: "Поле обязательно для заполнения", }) 
				} />
			  <label className = "form-label text-danger">{ errors?.email && errors?.email?.message }</label>
			</div>
			<div className = "form-outline mb-4">
			  <input type = "password" className = "form-control form-control-lg" placeholder = "Password..." 
				{ ...register("password", { 
					required: "Поле обязательно для заполнения" }) 
				} />
			  <label className = "form-label text-danger">{ errors?.password && errors?.password?.message }</label>
			</div>

			<div className = "d-flex justify-content-center">
			  <button type = "submit" disabled = { !isValid } className = "btn btn-success btn-block btn-lg gradient-custom-4 text-body">Войти</button>
			</div>
		  </form>
		</div>
	)
}

main_container.render(<App />)