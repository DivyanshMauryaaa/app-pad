'use client'

import { useState, useEffect } from "react";
import supabase from "@/supabase/client";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Save, Loader2, ListChecks } from "lucide-react";
import { toast } from "sonner";

type TodoList = {
  id: string;
  app_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

type Todo = {
  id: string;
  app_id: string;
  list_id: string;
  name: string;
  status: string;
  description: string;
  link: string;
  created_at: string;
  updated_at: string;
};

const AiPage = () => {
  const params = useParams();
  const appId = params.id as string;
  const { user } = useUser();
  
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [todos, setTodos] = useState<Record<string, Todo[]>>({});
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [generatedTodos, setGeneratedTodos] = useState<Omit<Todo, 'id' | 'list_id' | 'app_id' | 'created_at' | 'updated_at'>[]>([]);

  useEffect(() => {
    if (appId) {
      fetchTodoLists();
    }
  }, [appId]);

  const fetchTodoLists = async () => {
    const { data, error } = await supabase
      .from('todo_lists')
      .select('*')
      .eq('app_id', appId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todo lists:', error);
      toast.error('Failed to load todo lists');
      return;
    }

    setTodoLists(data || []);
    
    if (data && data.length > 0) {
      const todosData: Record<string, Todo[]> = {};
      for (const list of data) {
        const { data: todos, error } = await supabase
          .from('todos')
          .select('*')
          .eq('list_id', list.id)
          .order('created_at', { ascending: true });

        if (!error) {
          todosData[list.id] = todos || [];
        }
      }
      setTodos(todosData);
    }
  };

  const generateTodos = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a feature description');
      return;
    }

    setIsGenerating(true);
    try {
      // Call Google AI Studio API
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.NEXT_PUBLIC_GOOGLE_AI_STUDIO_API_KEY || ''
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Break down the following software feature into specific development tasks as a JSON array of objects with "name" and "description" properties. Each task should be actionable for a developer. Be concise but clear. Feature: ${prompt}`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the generated content
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        throw new Error('No generated content found in response');
      }

      // Try to parse the JSON from the response
      let parsedTodos;
      try {
        // The API might return markdown with JSON inside, so we try to extract it
        const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          parsedTodos = JSON.parse(jsonMatch[1]);
        } else {
          // If no markdown, try to parse the whole response as JSON
          parsedTodos = JSON.parse(generatedText);
        }
      } catch (e) {
        // If parsing fails, try to handle plain text response
        const lines = generatedText.split('\n').filter((line: any) => line.trim());
        parsedTodos = lines.map((line: any) => {
          const [name, ...descParts] = line.split(':');
          return {
            name: name.trim(),
            description: descParts.join(':').trim()
          };
        });
      }

      if (!Array.isArray(parsedTodos)) {
        throw new Error('Generated content is not in expected format');
      }

      // Create a new list with the prompt as the name
      setNewListName(`Feature: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`);
      setNewListDescription(prompt);
      
      // Set the generated todos in state
      setGeneratedTodos(parsedTodos.map(todo => ({
        name: todo.name || 'Unnamed task',
        description: todo.description || '',
        status: 'pending',
        link: ''
      })));

      toast.success('Tasks generated successfully');
    } catch (error) {
      console.error('Error generating todos:', error);
      toast.error('Failed to generate tasks. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveTodoList = async () => {
    if (!newListName.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    if (generatedTodos.length === 0) {
      toast.error('No tasks to save');
      return;
    }

    setIsSaving(true);
    try {
      // Save the todo list first
      const { data: listData, error: listError } = await supabase
        .from('todo_lists')
        .insert({
          app_id: appId,
          name: newListName,
          description: newListDescription,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (listError) throw listError;

      // Save all todos
      const todosToInsert = generatedTodos.map(todo => ({
        app_id: appId,
        list_id: listData.id,
        name: todo.name,
        status: todo.status,
        description: todo.description,
        link: todo.link,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: todosError } = await supabase
        .from('todos')
        .insert(todosToInsert);

      if (todosError) throw todosError;

      // Refresh the lists
      await fetchTodoLists();
      setSelectedListId(listData.id);
      setGeneratedTodos([]);
      setPrompt('');
      toast.success('Todo list saved successfully');
    } catch (error) {
      console.error('Error saving todo list:', error);
      toast.error('Failed to save todo list');
    } finally {
      setIsSaving(false);
    }
  };

  const updateTodoStatus = async (listId: string, todoId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', todoId);

      if (error) throw error;

      // Update local state
      setTodos(prev => ({
        ...prev,
        [listId]: prev[listId].map(todo => 
          todo.id === todoId ? { ...todo, status, updated_at: new Date().toISOString() } : todo
        )
      }));
    } catch (error) {
      console.error('Error updating todo status:', error);
      toast.error('Failed to update task status');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">AI Todo Generator</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate Development Tasks</CardTitle>
          <CardDescription>
            Describe a feature you want to implement and we'll break it down into actionable tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the feature you want to implement (e.g., 'Add user authentication with email/password and Google login')"
              rows={4}
            />
            <Button onClick={generateTodos} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ListChecks className="mr-2 h-4 w-4" />
                  Generate Tasks
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {(generatedTodos.length > 0 || selectedListId) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {generatedTodos.length > 0 ? "Generated Tasks" : "Todo List"}
            </CardTitle>
            <CardDescription>
              {generatedTodos.length > 0 
                ? "Review and save these tasks to your project"
                : "Manage your todo items"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedTodos.length > 0 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="list-name">List Name</Label>
                  <Input
                    id="list-name"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Enter a name for this list"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="list-description">Description</Label>
                  <Textarea
                    id="list-description"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="Enter a description for this list"
                    rows={2}
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Tasks</h3>
                  <div className="space-y-3">
                    {generatedTodos.map((todo, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Checkbox checked={todo.status === 'completed'} />
                        <div className="flex-1">
                          <p className="font-medium">{todo.name}</p>
                          {todo.description && (
                            <p className="text-sm text-muted-foreground">{todo.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={saveTodoList} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Todo List
                    </>
                  )}
                </Button>
              </div>
            ) : selectedListId && todos[selectedListId] ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {todos[selectedListId].map((todo) => (
                    <div key={todo.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Checkbox 
                        checked={todo.status === 'completed'} 
                        onCheckedChange={(checked) => 
                          updateTodoStatus(
                            selectedListId, 
                            todo.id, 
                            checked ? 'completed' : 'pending'
                          )
                        }
                      />
                      <div className="flex-1">
                        <p className="font-medium">{todo.name}</p>
                        {todo.description && (
                          <p className="text-sm text-muted-foreground">{todo.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {todoLists.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Your Todo Lists</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {todoLists.map((list) => (
              <Card 
                key={list.id} 
                className={`cursor-pointer hover:bg-accent ${selectedListId === list.id ? 'border-primary' : ''}`}
                onClick={() => setSelectedListId(list.id)}
              >
                <CardHeader>
                  <CardTitle>{list.name}</CardTitle>
                  <CardDescription>
                    {list.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {todos[list.id]?.length || 0} tasks
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiPage;