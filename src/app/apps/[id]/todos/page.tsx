'use client'

import { useState, useEffect } from "react"
import supabase from "@/supabase/client"
import { useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
// import { Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import PricingDialog from '@/app/components/PricingDialog';
import { useIsSubscribed } from "@/hooks/use-is-subscribed"

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

const TodoContent = () => {
    const params = useParams();
    const appId = params.id as string;

    const [lists, setLists] = useState<any[]>([]);
    const [allTodos, setAllTodos] = useState<any[]>([]); // Store all todos for all lists
    const [todos, setTodos] = useState<any[]>([]); // Only for selected list
    const [selectedList, setSelectedList] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // For adding new list/todo
    const [newListName, setNewListName] = useState('');
    const [newListDesc, setNewListDesc] = useState('');
    const [newTodoName, setNewTodoName] = useState('');
    const [newTodoDesc, setNewTodoDesc] = useState('');

    // Inline editing state
    const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
    const [editingTodoName, setEditingTodoName] = useState('');
    const [editingTodoDesc, setEditingTodoDesc] = useState('');

    // Pricing dialog state
    const [showPricing, setShowPricing] = useState(false);

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
        fetchAllTodos(); // Fetch all todos after lists
    };

    // Fetch all todos for the app
    const fetchAllTodos = async () => {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('app_id', appId)
            .order('created_at', { ascending: true });
        if (!error) setAllTodos(data || []);
    };

    // Fetch all todos for a list (for display)
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
        if (!isPro && lists.length >= 3) {
            setShowPricing(true);
            return;
        }
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
        if (!isPro) {
            const todosInList = allTodos.filter(t => t.list_id === selectedList);
            if (todosInList.length >= 10) {
                setShowPricing(true);
                return;
            }
        }
        const { data, error } = await supabase.from('todos').insert({
            app_id: appId,
            list_id: selectedList,
            name: newTodoName,
            description: newTodoDesc
        }).select();
        if (!error && data) setTodos(prev => [...prev, ...data]);
        setNewTodoName('');
        setNewTodoDesc('');
        fetchAllTodos();
    };

    // Update a todo
    const updateTodo = async (todoId: string, updates: any) => {
        await supabase.from('todos').update(updates).eq('id', todoId);
        fetchTodos(selectedList!);
        fetchAllTodos();
    };

    // Delete a todo
    const deleteTodo = async (todoId: string) => {
        await supabase.from('todos').delete().eq('id', todoId);
        setTodos(prev => prev.filter((t) => t.id !== todoId));
        fetchAllTodos();
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
        fetchAllTodos();
    };

    // Quick add handlers
    const handleListKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') addList();
    };
    const handleTodoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') addTodo();
    };

    // Progress calculation (use allTodos)
    const getListProgress = (listId: string) => {
        const listTodos = allTodos.filter((t: any) => t.list_id === listId);
        if (listTodos.length === 0) return 0;
        const completed = listTodos.filter((t: any) => t.status === 'completed').length;
        return Math.round((completed / listTodos.length) * 100);
    };

    const isPro = useIsSubscribed(appId) === 'true';

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
            <h2 className="text-3xl font-bold mb-6">Todo Lists</h2>
            <div className="flex flex-col md:flex-row gap-8">
                {/* Lists Column */}
                <div className="w-full md:w-1/3">
                    <div className="mb-4 flex gap-2 items-center">
                        <Input
                            placeholder="New list name"
                            value={newListName}
                            onChange={e => setNewListName(e.target.value)}
                            onKeyDown={handleListKeyDown}
                            className="bg-input text-foreground"
                        />
                        <Input
                            placeholder="Description"
                            value={newListDesc}
                            onChange={e => setNewListDesc(e.target.value)}
                            onKeyDown={handleListKeyDown}
                            className="bg-input text-foreground"
                        />
                        <Button
                            variant="secondary"
                            onClick={addList}
                            className="rounded-full p-2"
                            title="Add List"
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>
                    <ul className="space-y-4">
                        {lists.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">No lists yet. Create your first list!</div>
                        )}
                        {lists.map(list => (
                            <Card
                                key={list.id}
                                onClick={() => { setSelectedList(list.id); fetchTodos(list.id); }}
                                className={`hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer rounded-xl shadow-md transition-transform ${selectedList === list.id ? 'ring-2 ring-primary' : ''}`}
                            >
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-2xl font-semibold">{list.name}</CardTitle>
                                        <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); deleteList(list.id); }}>
                                            <Trash2 className="w-5 h-5 text-red-500" />
                                        </Button>
                                    </div>
                                    <CardDescription>{list.description}</CardDescription>
                                    <div className="mt-2">
                                        <Progress value={getListProgress(list.id)} className="h-2" />
                                        <span className="text-xs text-muted-foreground">{getListProgress(list.id)}% completed</span>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </ul>
                </div>
                {/* Todos Column */}
                <div className="w-full md:w-2/3">
                    {selectedList ? (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <Input
                                    placeholder="Todo name"
                                    value={newTodoName}
                                    onChange={e => setNewTodoName(e.target.value)}
                                    onKeyDown={handleTodoKeyDown}
                                    className="bg-input text-foreground"
                                />
                                <Input
                                    placeholder="Description"
                                    value={newTodoDesc}
                                    onChange={e => setNewTodoDesc(e.target.value)}
                                    onKeyDown={handleTodoKeyDown}
                                    className="bg-input text-foreground"
                                />
                                <Button
                                    variant="default"
                                    onClick={addTodo}
                                    className="rounded-full p-2"
                                    title="Add Todo"
                                >
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>
                            <ul className="space-y-4">
                                {todos.length === 0 && (
                                    <div className="text-center text-muted-foreground py-8">No todos in this list. Add your first task!</div>
                                )}
                                {todos.map(todo => (
                                    <li key={todo.id} className="">
                                        <Card className={`rounded-xl shadow-md transition-all ${todo.status === 'completed' ? 'opacity-70' : ''}`}>
                                            <CardHeader className="flex flex-row items-center gap-4">
                                                <div className="flex-1">
                                                    {editingTodoId === todo.id ? (
                                                        <div className="flex flex-col gap-2">
                                                            <Input
                                                                value={editingTodoName}
                                                                onChange={e => setEditingTodoName(e.target.value)}
                                                                onBlur={async () => {
                                                                    await updateTodo(todo.id, { name: editingTodoName });
                                                                    setEditingTodoId(null);
                                                                }}
                                                                onKeyDown={async (e) => {
                                                                    if (e.key === 'Enter') {
                                                                        await updateTodo(todo.id, { name: editingTodoName });
                                                                        setEditingTodoId(null);
                                                                    }
                                                                }}
                                                                autoFocus
                                                            />
                                                            <Input
                                                                value={editingTodoDesc}
                                                                onChange={e => setEditingTodoDesc(e.target.value)}
                                                                onBlur={async () => {
                                                                    await updateTodo(todo.id, { description: editingTodoDesc });
                                                                    setEditingTodoId(null);
                                                                }}
                                                                onKeyDown={async (e) => {
                                                                    if (e.key === 'Enter') {
                                                                        await updateTodo(todo.id, { description: editingTodoDesc });
                                                                        setEditingTodoId(null);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl font-semibold cursor-pointer hover:underline" onClick={() => { setEditingTodoId(todo.id); setEditingTodoName(todo.name); setEditingTodoDesc(todo.description); }}>{todo.name}</span>
                                                                <Badge className={`${statusColors[todo.status] || ''} ml-2`}>{todo.status.replace('_', ' ')}</Badge>
                                                                {todo.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500 ml-1" />}
                                                            </div>
                                                            <div className="text-muted-foreground cursor-pointer hover:underline" onClick={() => { setEditingTodoId(todo.id); setEditingTodoName(todo.name); setEditingTodoDesc(todo.description); }}>{todo.description}</div>
                                                        </>
                                                    )}
                                                </div>
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
                                                    title="Delete Todo"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </Button>
                                            </CardHeader>
                                        </Card>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-16">
                            <p className="text-2xl text-muted-foreground mb-4">Select a list to view its todos</p>
                            <Plus className="w-12 h-12 text-muted-foreground animate-bounce" />
                        </div>
                    )}
                </div>
            </div>
            <PricingDialog open={showPricing} onOpenChange={setShowPricing} appId={appId} />
        </div>
    )
}

export default TodoContent;