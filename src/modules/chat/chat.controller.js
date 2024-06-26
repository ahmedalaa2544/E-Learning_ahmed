import webpush from "web-push";
import chatModel from "../../../DB/model/chat.model.js";
import notificationModel from "../../../DB/model/notification.model.js";
import userModel from "../../../DB/model/user.model.js";
import { asyncHandler } from "../../utils/asyncHandling.js";
import upload from "../../utils/azureServices.js";
import { getIo } from "../../utils/server.js";

export const sendMsg = asyncHandler(async (req, res, next) => {
  const { message } = req.body;
  const { chatId } = req.params;

  // get the chat
  let chat = await chatModel
    .findById(chatId)
    .populate([
      { path: "participants", select: "userName profilePic socketId popUpId" },
    ]);

  // create chat if not found
  if (!chat) {
    return next(new Error("chat not found", { cause: 404 }));
  }
  const dateOfPublish = Date.now(); // to change the url from pic to another
  // sockets who sent to them
  let destIds = chat.participants.filter(
    (participant) => participant.id !== req.user.id
  );
  let socketIds = destIds.map((participant) => participant.socketId);
  let popUpIds = destIds.map((participant) => participant.popUpId);
  let destId = destIds.map((participant) => participant.id);

  // Send files
  if (req.file) {
    // Extract the extension for the promotion media.
    const blobMediaExtension = req.file.originalname.split(".").pop();
    // Define the path for the promotion media in the user's course directory.
    const blobMediaName = `Users\\${req.user.userName}\\ChatMedia\\${dateOfPublish}.${blobMediaExtension}`;
    const url = `https://elearningtest123.blob.core.windows.net/upload/Users/${req.user.userName}/ChatMedia/${dateOfPublish}.${blobMediaExtension}`;
    // Upload media and obtain its URL.
    let typeOfMedia = req.file.mimetype.split("/")[0];
    const mediaUrl = await upload(
      req.file.path,
      blobMediaName,
      typeOfMedia,
      blobMediaExtension
    );

    // save changes in DB
    chat.messages.push({
      from: req.user.id,
      to: chatId,
      media: {
        url: url,
        size: req.file.size,
        name: req.file.originalname,
        typeOfMedia,
      },
      time: dateOfPublish,
    });
    getIo()
      .to(socketIds)
      .emit("recieveMsg", {
        from: req.user.id,
        to: chatId,
        media: {
          url: url,
          size: req.file.size,
          name: req.file.originalname,
          typeOfMedia,
        },
        time: dateOfPublish,
      });
    chat.messages.status = "delivered";
    await chat.save();

    // add notification
    let notification = {
      image: req.user.profilePic.url,
      title: "New Message",
      body: `${req.user.userName} sent you a ${typeOfMedia}`,
      url: `https://e-learning-azure.vercel.app/instructor/messages/${chatId}`,
    };
    let notify = await notificationModel.findOneAndUpdate(
      {
        user: { $in: destId },
      },
      {
        $push: { notifications: notification },
      },
      { new: true }
    );

    if (!notify) {
      notify = await notificationModel.create({
        user: destId[0],
        notifications: notification,
      });
    }
    notification = notify.notifications.reverse()[0];
    getIo().to(socketIds).emit("notification", notification);
    if (destIds[0].popUpId.endpoint) {
      webpush.sendNotification(
        destIds[0].popUpId,
        JSON.stringify(notification)
      );
    }
    return res.status(200).json({ message: "Done" });
  }

  // Send messages
  if (message) {
    chat.messages.push({
      from: req.user.id,
      to: chatId,
      text: message,
      time: dateOfPublish,
    });
    await chat.save();
    getIo().to(socketIds).emit("recieveMsg", {
      from: req.user.id,
      to: chatId,
      text: message,
      time: dateOfPublish,
    });
    chat.messages.status = "delivered";

    // add notification
    let notification = {
      image: req.user.profilePic.url,
      title: "New Message",
      body: `${req.user.userName} sent you a message`,
      url: `https://e-learning-azure.vercel.app/instructor/messages/${chatId}`,
    };
    let notify = await notificationModel.findOneAndUpdate(
      {
        user: { $in: destId },
      },
      {
        $push: { notifications: notification },
      },
      { new: true }
    );

    if (!notify) {
      notify = await notificationModel.create({
        user: destId[0],
        notifications: notification,
      });
    }
    notification = notify.notifications.reverse()[0];
    getIo().to(socketIds).emit("notification", notification);
    if (destIds[0].popUpId.endpoint) {
      webpush.sendNotification(
        destIds[0].popUpId,
        JSON.stringify(notification)
      );
    }

    return res.status(200).json({ message: "Done" });
  }
  getIo().to(req.user.socketId).emit("emptyMsg", "Please, Enter Vaild Message");

  return next(new Error("Please, Enter Vaild Message", { cause: 400 }));
});

export const getChat = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;
  const { user } = req.query;
  if (user == "true") {
    if (chatId == req.user.id) {
      return next(
        new Error("Enter Vaild User (Not Yourself Psycho!)", { cause: 400 })
      );
    }
    let chat = await chatModel
      .findOne({
        participants: { $all: [chatId, req.user.id] },
        type: "private",
      })
      .populate([{ path: "participants", select: "userName profilePic" }])
      .select("-messages");
    if (!chat) {
      const checkUser = await userModel.findById(chatId);
      if (!checkUser) return next(new Error("user not found", { cause: 404 }));
      let arr = [req.user.id, chatId];
      chat = await chatModel.create({
        participants: arr,
        messages: [],
        type: "private",
      });
      chat = await chatModel
        .findById(chat.id)
        .populate([{ path: "participants", select: "userName profilePic" }])
        .select("-messages");
      return res.status(201).json({ message: "Done", chat });
    }
    return res.status(200).json({ message: "Done", chat });
  }

  const chat = await chatModel
    .findById(chatId)
    .populate([{ path: "participants", select: "userName profilePic" }])
    .select("-messages");

  if (!chat) return next(new Error("chat not found", { cause: 404 }));
  return res.status(200).json({ message: "Done", chat });
});

export const Chats = asyncHandler(async (req, res) => {
  const chat = await chatModel
    .find({ participants: { $elemMatch: { $eq: req.user.id } } })
    .populate([{ path: "participants", select: "userName profilePic" }])
    .sort({ updatedAt: -1 })
    .slice("messages", -1);

  return res.status(200).json({ message: "Done", chat });
});

export const allMessages = asyncHandler(async (req, res, next) => {
  const page = req.query.page || 0;
  const limit = 15;

  const startIndex = +page * limit;
  const endIndex = (+page + 1) * limit;
  const { chatId } = req.params;

  const chat = await chatModel
    .findById(chatId)
    .populate([{ path: "participants", select: "userName profilePic" }]);

  const messages = chat.messages.reverse().slice(startIndex, endIndex);
  return res.status(200).json({ message: "Done", messages });
});

export const createGroup = asyncHandler(async (req, res, next) => {
  const { name, participants } = req.body;

  let imageUrl;
  // Send files
  if (req.file) {
    // Extract the extension for the promotion media.
    const blobMediaExtension = req.file.originalname.split(".").pop();
    // Define the path for the promotion media in the user's course directory.
    const dateOfPublish = Date.now();
    const blobMediaName = `Users\\${req.user.userName}\\ChatMedia\\${dateOfPublish}.${blobMediaExtension}`;
    // Upload media and obtain its URL.
    let typeOfMedia = req.file.mimetype.split("/")[0];
    imageUrl = await upload(
      req.file.path,
      blobMediaName,
      typeOfMedia,
      blobMediaExtension
    );
  }
  const chat = await chatModel.create({
    name,
    participants,
    type: "group",
    messages: [],
    pic: imageUrl ? imageUrl : "",
  });
  return res.status(200).json({ message: "Done", chat });
});
