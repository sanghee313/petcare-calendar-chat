# node-chat

# 채팅 기능 구현

```javascript
/* 접속된 모든 소켓에게 데이터 전달 */
io.sockets.emit("이벤트명", 데이터);

/* 나를 제외한 모든 소켓에게 데이터 전달*/
socket.broadcast.emit("이벤트명", 데이터);
```

# 강좌

- [전체강좌 보기](https://github.com/leegeunhyeok/node-chat/blob/master/README.md)
