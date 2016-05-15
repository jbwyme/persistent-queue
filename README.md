A simple client-side queue that persists between page loads using different storage strategies for cross-browser support

### Installation
`npm install --save persistent-queue`

### Usage
```
const queue = new Queue('name');
queue.add('some item');
const item = queue.next();
const wasRemoved = queue.remove(item);
```

### Browser support
Todo
