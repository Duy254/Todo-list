//console.log("hello world")

/* 
  client side
    template: static template
    logic(js): MVC(model, view, controller): used to server side technology, single page application
        model: prepare/manage data,
        view: manage view(DOM),
        controller: business logic, event bindind/handling

  server side
    json-server
    CRUD: create(post), read(get), update(put, patch), delete(delete)


*/

//read
/* fetch("http://localhost:3000/todos")
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
    }); */

const APIs = (() => {
    const createTodo = (newTodo) => {
        return fetch("http://localhost:3000/todos", {
            method: "POST",
            body: JSON.stringify(newTodo),
            headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
    };

    const deleteTodo = (id) => {
        return fetch("http://localhost:3000/todos/" + id, {
            method: "DELETE",
        }).then((res) => res.json());
    };

    const getTodos = () => {
        return fetch("http://localhost:3000/todos").then((res) => res.json());
    };

    const updateTodo = (id, updatedTodo) => {
        return fetch(`http://localhost:3000/todos/${id}`, {
          method: "PUT",
          body: JSON.stringify(updatedTodo),
          headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
      };
    return { createTodo, deleteTodo, getTodos, updateTodo };

    
})();

//IIFE
//todos
/* 
    hashMap: faster to search
    array: easier to iterate, has order


*/
const Model = (() => {
    class State {
        #todos; //private field
        #completed;
        #onChange; //function, will be called when setter function todos is called
        constructor() {
            this.#todos = [];
            this.#completed = [];
        }
        get todos() {
            return this.#todos;
        }
        set todos(newTodos) {
            // reassign value
            console.log("setter function");
            this.#todos = newTodos;
            this.#onChange?.(); // rendering
        }

        get completed() {
            return this.#completed;
        }
        set completed(newTodos) {
            // reassign value
            console.log("setter function");
            this.#completed = newTodos;
            this.#onChange?.(); // rendering
        }

        subscribe(callback) {
            //subscribe to the change of the state todos
            this.#onChange = callback;
        }
    }
    const { getTodos, createTodo, deleteTodo, updateTodo } = APIs;
    return {
        State,
        getTodos,
        createTodo,
        deleteTodo,
        updateTodo,
    };
})();
/* 
    todos = [
        {
            id:1,
            content:"eat lunch"
        },
        {
            id:2,
            content:"eat breakfast"
        }
    ]

*/
const View = (() => {
    const todolistEl = document.querySelector(".todo-list");
    const completedTodolistEl = document.querySelector(".completed-todo-list");
    const submitBtnEl = document.querySelector(".submit-btn");
    const inputEl = document.querySelector(".input");

    //for pending list
    const renderTodos = (todos) => {
        let todosTemplate = "";
        todos.forEach((todo) => {
            const liTemplate = `
            <li>
                <span>${todo.content}</span>
                <button class="delete-btn" id="${todo.id}">delete</button>
                <button class="edit-btn" id="${todo.id}">edit</button>
                <button class="right-btn" id="${todo.id}">right</button>
            </li>`;
            todosTemplate += liTemplate;
        });
        if (todos.length === 0) {
            todosTemplate = "<h4>no task to display!</h4>";
        }
        todolistEl.innerHTML = todosTemplate;
    };

    //For completed list
    const renderCompletedTodos = (todos) => {
        let todosTemplate = "";
        todos.forEach((todo) => {
            const liTemplate = `
            <li>
                <span>${todo.content}</span>
                <button class="delete-btn" id="${todo.id}">delete</button>
                <button class="edit-btn" id="${todo.id}">edit</button>
                <button class="left-btn" id="${todo.id}">left</button>
            </li>`;
            todosTemplate += liTemplate;
        });
        if (todos.length === 0) {
            todosTemplate = "<h4>no task to display!</h4>";
        }
        // completedTodolistEl.innerHTML = "";
    };


    const clearInput = () => {
        inputEl.value = "";
    };

    return { renderTodos, renderCompletedTodos, submitBtnEl, inputEl, clearInput, todolistEl, completedTodolistEl };
})();

const Controller = ((view, model) => {
    const state = new model.State();
    const init = () => {
        model.getTodos().then((todos) => {
            todos.reverse();
            state.todos = todos;
            view.renderTodos(state.todos);
            view.renderCompletedTodos(state.completed);
        });
    };

    const handleSubmit = () => {
        view.submitBtnEl.addEventListener("click", (event) => {
            /* 
                1. read the value from input
                2. post request
                3. update view
            */
            const inputValue = view.inputEl.value;
            model.createTodo({ content: inputValue }).then((data) => {
                state.todos = [data, ...state.todos];
                view.clearInput();
            });
        });
    };

    const handleDelete = () => {
        //event bubbling
        /* 
            1. get id
            2. make delete request
            3. update view, remove
        */
        view.todolistEl.addEventListener("click", (event) => {
            if (event.target.className === "delete-btn") {
                const id = event.target.id;
                console.log("id", typeof id);
                model.deleteTodo(+id).then((data) => {
                    state.todos = state.todos.filter((todo) => todo.id !== +id);
                });
            }
        });
    };

    const handleEdit = () => {
        //event 
        /*
        1. get id
        2. 
        3. update view
        */
        view.todolistEl.addEventListener("click", (event) => {
            if(event.target.className === "edit-btn"){
                const id = event.target.id;
                console.log("id", typeof id);
                const currentContent = event.target.previousElementSibling.previousElementSibling;

                if(event.target.textContent === "edit"){
                    // const currentContent = spanEL.innerText;
                    // console.log(currentContent);

                    // const newContent = document.createElement("input");
                    // newContent.value = currentContent;
                    // spanEL.innerHTML = "";
                    // spanEL.appendChild(newContent);

                    event.target.textContent = "save";
                    currentContent.contentEditable = "true";
            }
            else{
                event.target.textContent = "edit";
                currentContent.contentEditable = "false";
                const newContent = currentContent.textContent;
                    model.updateTodo(id, { content: newContent }).then((data) => {
                        state.todos = state.todos.map((todo) =>
                          todo.id === data.id ? data : todo
                        );
            });
            }
            }}
        )};

    const handleShift = () => {
            view.todolistEl.addEventListener("click", (event)=> {
                if(event.target.className === "right-btn"){
                    const id = event.target.id;
                    console.log("id", id);
                    const updatedTodo = {
                        status: "completed"
                    };
                    model.updateTodo(id, updatedTodo).then((data) => {
                        // const completedTodo = state.todos.find((todo) => todo.id === data.id);
                        state.todos = state.todos.filter((todo) => todo.id !== data.id);
                        state.completed = [data, ...state.completed];
                        console.log(state.completed);
                        // view.renderTodos(state.todos);
                        // view.renderCompletedTodos(state.completed);
                    });
                        
                    // })
                    // model.deleteTodo(+id).then((data) => {
                    //     state.todos = state.todos.filter((todo) => todo.id !== +id);
                    // });
                  


                   
        
                }
            })
        }

          

    const bootstrap = () => {
        init();
        handleSubmit();
        handleDelete();
        handleEdit();
        handleShift();
        state.subscribe(() => {
            view.renderTodos(state.todos);
            view.renderCompletedTodos(state.completed);
        });
    };
    return {
        bootstrap,
    };
})(View, Model); //ViewModel

Controller.bootstrap();
