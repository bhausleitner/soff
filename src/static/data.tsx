export const userData = [
  {
    id: 1,
    avatar:
      "/https://gravatar.com/avatar/cdcee25bb6af17a4dd96bde5beec31dd?s=400&d=robohash&r=x",
    messages: [
      {
        id: 1,
        avatar:
          "https://gravatar.com/avatar/cdcee25bb6af17a4dd96bde5beec31dd?s=400&d=robohash&r=x",
        name: "Jane Doe",
        message: "Hey, Jakob"
      },
      {
        id: 2,
        avatar:
          "https://gravatar.com/avatar/cdcee25bb6af17a4dd96bde5beec31dd?s=400&d=robohash&r=x",
        name: "Jakob Hoeg",
        message: "Hey!"
      },
      {
        id: 3,
        avatar:
          "https://gravatar.com/avatar/cdcee25bb6af17a4dd96bde5beec31dd?s=400&d=robohash&r=x",
        name: "Jane Doe",
        message: "How are you?"
      },
    ],
    name: "Jane Doe"
  },
  {
    id: 2,
    avatar: "/User2.png",
    name: "John Doe"
  },
  {
    id: 3,
    avatar: "/User3.png",
    name: "Elizabeth Smith"
  },
  {
    id: 4,
    avatar: "/User4.png",
    name: "John Smith"
  }
];

export type UserData = (typeof userData)[number];

export const loggedInUserData = {
  id: 5,
  avatar: "/LoggedInUser.jpg",
  name: "Jakob Hoeg"
};

export type LoggedInUserData = typeof loggedInUserData;

export interface Message {
  id: number;
  avatar: string;
  name: string;
  message: string;
}

export interface User {
  id: number;
  avatar: string;
  messages: Message[];
  name: string;
}
