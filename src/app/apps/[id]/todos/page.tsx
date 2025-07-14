'use client'

import { useState, useEffect } from "react"
import supabase from "@/supabase/client"
import { useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const TodoContent = () => {
    const params = useParams();
    const appId = params.id as string;

    const [lists, setLists] = useState<any[]>([]);
    const [todos, setTodos] = useState<any[]>([]);
    const [selectedList, setSelectedList] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // For adding new list/todo
    const [newListName, setNewListName] = useState('');
    const [newListDesc, setNewListDesc] = useState('');
    const [newTodoName, setNewTodoName] = useState('');
    const [newTodoDesc, setNewTodoDesc] = useState('');

    // Fetch all todo lists for this app
    const fetchLists = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('todo_lists')
            .select('*')
            .eq('app_id', appId)
            .order('created_at', { ascending: true });
        if (!error) setLists(data || []);
        setLoading(false);
    };

    // Fetch all todos for a list
    const fetchTodos = async (listId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('app_id', appId)
            .eq('list_id', listId)
            .order('created_at', { ascending: true });
        if (!error) setTodos(data || []);
        setLoading(false);
    };

    // Add a new todo list
    const addList = async () => {
        if (!newListName) return;
        const { data, error } = await supabase.from('todo_lists').insert(
            {
                app_id: appId,
                name: newListName,
                description: newListDesc
            }
        ).select();
        if (!error && data) setLists(prev => [...prev, ...data]);
        setNewListName('');
        setNewListDesc('');
    };

    // Add a new todo
    const addTodo = async () => {
        if (!selectedList || !newTodoName) return;
        const { data, error } = await supabase.from('todos').insert({
            app_id: appId,
            list_id: selectedList,
            name: newTodoName,
            description: newTodoDesc
        }).select();
        if (!error && data) setTodos(prev => [...prev, ...data]);
        setNewTodoName('');
        setNewTodoDesc('');
    };

    // Update a todo
    const updateTodo = async (todoId: string, updates: any) => {
        await supabase.from('todos').update(updates).eq('id', todoId);
        fetchTodos(selectedList!);
    };

    // Delete a todo
    const deleteTodo = async (todoId: string) => {
        await supabase.from('todos').delete().eq('id', todoId);
        setTodos(prev => prev.filter((t) => t.id !== todoId));
    };

    // Delete a list (and its todos)
    const deleteList = async (listId: string) => {
        await supabase.from('todos').delete().eq('list_id', listId);
        await supabase.from('todo_lists').delete().eq('id', listId);
        setLists(prev => prev.filter((l) => l.id !== listId));
        if (selectedList === listId) {
            setSelectedList(null);
            setTodos([]);
        }
    };

    useEffect(() => {
        if (appId) fetchLists();
    }, [appId]);

    useEffect(() => {
        if (selectedList) fetchTodos(selectedList);
        else setTodos([]);
    }, [selectedList]);

    if (loading && lists.length === 0) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground min-h-screen p-6">
            <h2 className="text-2xl font-bold mb-4">Todo Lists</h2>
            <div className="mb-4 flex gap-2">
                <Input
                    placeholder="New list name"
                    value={newListName}
                    onChange={e => setNewListName(e.target.value)}
                    className="bg-input text-foreground"
                />
                <Input
                    placeholder="Description"
                    value={newListDesc}
                    onChange={e => setNewListDesc(e.target.value)}
                    className="bg-input text-foreground"
                />
                <Button
                    variant="secondary"
                    onClick={addList}
                >
                    Add List
                </Button>
            </div>
            <div className="flex gap-4">
                <div className="w-1/3">
                    <ul>
                        {lists.map(list => (
                            <li
                                key={list.id}
                                className={`p-2 rounded cursor-pointer mb-2 transition-colors ${selectedList === list.id ? 'bg-muted' : 'bg-card'} flex justify-between items-center`}
                                onClick={() => setSelectedList(list.id)}
                            >
                                <p className="text-xl">{list.name}</p>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="ml-2 cursor-pointer hover:text-red-600"
                                    onClick={e => { e.stopPropagation(); deleteList(list.id); }}
                                >
                                    <Trash2 />
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="w-2/3">
                    {selectedList ? (
                        <>
                            <h3 className="text-xl font-semibold mb-2">Todos</h3>
                            <div className="mb-2 flex gap-2">
                                <Input
                                    placeholder="Todo name"
                                    value={newTodoName}
                                    onChange={e => setNewTodoName(e.target.value)}
                                    className="bg-input text-foreground"
                                />
                                <Input
                                    placeholder="Description"
                                    value={newTodoDesc}
                                    onChange={e => setNewTodoDesc(e.target.value)}
                                    className="bg-input text-foreground"
                                />
                                <Button
                                    variant="default"
                                    onClick={addTodo}
                                >
                                    Add Todo
                                </Button>
                            </div>
                            <ul>
                                {todos.map(todo => (
                                    <li
                                        key={todo.id}
                                        className="p-3 rounded-md mb-2"
                                    >
                                        <Card>
                                            <CardHeader>
                                                <CardTitle
                                                    className="text-2xl"
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={async (e) => {
                                                        const newName = (e.target as HTMLElement).innerText;
                                                        if (newName !== todo.name) {
                                                            await supabase.from('todos').update({ name: newName }).eq('id', todo.id);
                                                            fetchTodos(selectedList!);
                                                        }
                                                    }}
                                                >
                                                    {todo.name}
                                                </CardTitle>
                                                <CardDescription
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={async (e) => {
                                                        const newDescription = (e.target as HTMLElement).innerText;
                                                        if (newDescription !== todo.name) {
                                                            await supabase.from('todos').update({ description: newDescription }).eq('id', todo.id);
                                                            fetchTodos(selectedList!);
                                                        }
                                                    }}
                                                >{todo.description}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center gap-4">
                                                    {/* <label className="font-medium">Status:</label> */}
                                                    <select
                                                        className="bg-background border-input border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                                        value={todo.status || "pending"}
                                                        onChange={e => updateTodo(todo.id, { status: e.target.value })}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="in_progress">In Progress</option>
                                                        <option value="completed">Completed</option>
                                                    </select>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="ml-auto"
                                                        onClick={() => deleteTodo(todo.id)}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <div></div>
                    )}
                </div>
            </div>
        </div >
    )
}

export default TodoContent;