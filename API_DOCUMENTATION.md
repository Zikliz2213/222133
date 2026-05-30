# API Документация

## Backend URL
- **HTTP API**: `https://pipipupu-production.up.railway.app`
- **WebSocket**: `wss://pipipupu-production.up.railway.app`

## Аутентификация

Все защищенные endpoints требуют JWT токен в заголовке:
```
Authorization: Bearer <token>
```

## HTTP API Endpoints

### Аутентификация

#### POST /auth/register
Регистрация нового пользователя

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "username": "johndoe",
    "displayName": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /auth/login
Вход в систему

**Request:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "username": "johndoe",
    "displayName": "John Doe"
  }
}
```

#### GET /auth/me
Получить информацию о текущем пользователе (требует аутентификации)

**Response:**
```json
{
  "id": "user_123",
  "username": "johndoe",
  "displayName": "John Doe",
  "email": "john@example.com",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "Hello, I'm John!",
  "isOnline": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Пользователи

#### GET /users/search?q={query}
Поиск пользователей

**Response:**
```json
[
  {
    "id": "user_456",
    "username": "janedoe",
    "displayName": "Jane Doe",
    "avatar": "https://example.com/avatar2.jpg"
  }
]
```

#### PUT /users/me
Обновить профиль текущего пользователя

**Request:**
```json
{
  "displayName": "John Doe Updated",
  "bio": "New bio text",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Response:**
```json
{
  "id": "user_123",
  "username": "johndoe",
  "displayName": "John Doe Updated",
  "bio": "New bio text",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

### Чаты

#### GET /chats
Получить список чатов текущего пользователя

**Response:**
```json
[
  {
    "id": "chat_789",
    "type": "chat",
    "name": "Jane Doe",
    "avatar": "https://example.com/avatar2.jpg",
    "isOnline": true,
    "lastMessage": {
      "id": "msg_001",
      "content": "Hey, how are you?",
      "createdAt": "2024-01-01T12:00:00Z"
    },
    "unreadCount": 2,
    "createdAt": "2024-01-01T10:00:00Z"
  }
]
```

#### POST /chats
Создать новый чат

**Request:**
```json
{
  "userId": "user_456"
}
```

**Response:**
```json
{
  "id": "chat_new",
  "type": "chat",
  "name": "Jane Doe",
  "participants": ["user_123", "user_456"],
  "createdAt": "2024-01-01T14:00:00Z"
}
```

#### GET /chats/:chatId/messages
Получить сообщения чата

**Query Parameters:**
- `limit` (optional): количество сообщений (default: 50)
- `before` (optional): ID сообщения для пагинации

**Response:**
```json
[
  {
    "id": "msg_001",
    "chatId": "chat_789",
    "userId": "user_456",
    "content": "Hey, how are you?",
    "attachments": [],
    "reactions": [
      { "emoji": "👍", "count": 2, "users": ["user_123", "user_789"] }
    ],
    "isRead": true,
    "createdAt": "2024-01-01T12:00:00Z"
  }
]
```

#### POST /chats/:chatId/messages
Отправить сообщение

**Request:**
```json
{
  "content": "Hello there!",
  "attachments": [
    {
      "type": "image",
      "url": "https://example.com/photo.jpg",
      "name": "photo.jpg"
    }
  ]
}
```

**Response:**
```json
{
  "id": "msg_new",
  "chatId": "chat_789",
  "userId": "user_123",
  "content": "Hello there!",
  "attachments": [...],
  "createdAt": "2024-01-01T14:30:00Z"
}
```

### Каналы

#### POST /channels
Создать канал

**Request:**
```json
{
  "name": "My Channel",
  "description": "This is my awesome channel"
}
```

**Response:**
```json
{
  "id": "channel_001",
  "type": "channel",
  "name": "My Channel",
  "description": "This is my awesome channel",
  "subscribersCount": 1,
  "createdAt": "2024-01-01T15:00:00Z"
}
```

#### POST /channels/:channelId/subscribe
Подписаться на канал

**Response:**
```json
{
  "success": true,
  "subscribersCount": 101
}
```

#### POST /channels/:channelId/unsubscribe
Отписаться от канала

**Response:**
```json
{
  "success": true,
  "subscribersCount": 100
}
```

### Сообщения

#### POST /messages/:messageId/reactions
Добавить реакцию на сообщение

**Request:**
```json
{
  "emoji": "👍"
}
```

**Response:**
```json
{
  "id": "msg_001",
  "reactions": [
    { "emoji": "👍", "count": 3, "users": ["user_123", "user_456", "user_789"] }
  ]
}
```

#### DELETE /messages/:messageId/reactions/:emoji
Удалить реакцию

**Response:**
```json
{
  "success": true
}
```

### Поиск

#### GET /search?q={query}
Глобальный поиск по чатам, каналам и сообщениям

**Response:**
```json
{
  "chats": [...],
  "channels": [...],
  "messages": [...]
}
```

### Загрузка файлов

#### POST /upload
Загрузить файл (multipart/form-data)

**Request:**
```
Content-Type: multipart/form-data

file: [binary data]
```

**Response:**
```json
{
  "id": "file_001",
  "type": "image",
  "url": "https://example.com/uploads/file.jpg",
  "name": "file.jpg",
  "size": 1024567,
  "mimeType": "image/jpeg"
}
```

#### POST /upload/avatar
Загрузить аватар (multipart/form-data)

**Response:**
```json
{
  "url": "https://example.com/avatars/avatar.jpg"
}
```

## WebSocket API

### Подключение
```javascript
const ws = new WebSocket('wss://pipipupu-production.up.railway.app?token=YOUR_JWT_TOKEN');
```

### События от клиента к серверу

#### Отправка сообщения
```json
{
  "type": "message",
  "data": {
    "chatId": "chat_789",
    "content": "Hello!",
    "attachments": []
  }
}
```

#### Индикатор набора текста
```json
{
  "type": "typing",
  "data": {
    "chatId": "chat_789"
  }
}
```

#### Отметка о прочтении
```json
{
  "type": "read",
  "data": {
    "chatId": "chat_789",
    "messageId": "msg_001"
  }
}
```

### События от сервера к клиенту

#### Новое сообщение
```json
{
  "type": "message",
  "data": {
    "id": "msg_new",
    "chatId": "chat_789",
    "userId": "user_456",
    "content": "Hello!",
    "createdAt": "2024-01-01T14:30:00Z"
  }
}
```

#### Пользователь печатает
```json
{
  "type": "typing",
  "data": {
    "chatId": "chat_789",
    "userId": "user_456"
  }
}
```

#### Пользователь онлайн
```json
{
  "type": "online",
  "data": {
    "userId": "user_456"
  }
}
```

#### Пользователь офлайн
```json
{
  "type": "offline",
  "data": {
    "userId": "user_456",
    "lastSeen": "2024-01-01T14:30:00Z"
  }
}
```

#### Сообщение прочитано
```json
{
  "type": "read",
  "data": {
    "chatId": "chat_789",
    "messageId": "msg_001",
    "userId": "user_456"
  }
}
```

## Коды ошибок

- `400` - Bad Request (неверные данные)
- `401` - Unauthorized (не авторизован)
- `403` - Forbidden (нет доступа)
- `404` - Not Found (не найдено)
- `409` - Conflict (конфликт, например username уже занят)
- `500` - Internal Server Error (ошибка сервера)

## Примеры использования

### Регистрация и вход
```javascript
// Регистрация
const response = await fetch('https://pipipupu-production.up.railway.app/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123',
    displayName: 'John Doe'
  })
});
const { token } = await response.json();
localStorage.setItem('token', token);
```

### Создание чата и отправка сообщения
```javascript
const token = localStorage.getItem('token');

// Создать чат
const chat = await fetch('https://pipipupu-production.up.railway.app/chats', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ userId: 'user_456' })
}).then(r => r.json());

// Отправить сообщение
await fetch(`https://pipipupu-production.up.railway.app/chats/${chat.id}/messages`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ content: 'Hello!' })
});
```

### WebSocket соединение
```javascript
const token = localStorage.getItem('token');
const ws = new WebSocket(`wss://pipipupu-production.up.railway.app?token=${token}`);

ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

// Отправить сообщение
ws.send(JSON.stringify({
  type: 'message',
  data: { chatId: 'chat_789', content: 'Hello via WebSocket!' }
}));
```
