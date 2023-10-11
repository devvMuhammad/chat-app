import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuthContext } from "../../auth/userContext";

const chatNamesList1 = [
  { headingName: "Public", name: "public" },
  { headingName: "Football", name: "football" },
  { headingName: "Friends", name: "friends" },
  { headingName: "WWE", name: "wwe" },
];

function ChatBar({ location }) {
  const [chatNamesList, setChatNamesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setUserData } = useAuthContext();
  useEffect(() => {
    async function fetchChatNames() {
      // no need to check for token, already checked when fetching messages
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chatNamesList`
      );
      const { data } = await response.json();
      setChatNamesList(data);
      const chatsAccessObject = data.reduce((acc, elm) => {
        acc[elm.name] = elm.chatType === "public";
        return acc;
      }, {});
      // updates userData to keep track of access to private chats
      setUserData((prev) => {
        return { ...prev, chatsAccess: chatsAccessObject };
      });
      // console.log(data, chatsAccessObject);
    }
    setLoading(true);
    fetchChatNames().finally(() => setLoading(false));
  }, []);
  return (
    <div
      className={` ${
        location === "drawer"
          ? ""
          : "hidden md:flex md:card md:card-normal md:border-2 md:border-solid md:border-primary md:flex-col md:gap-10 w-[40%] ml-2"
      }  `}
    >
      {loading ? (
        <div className="flex h-full w-full justify-center items-center">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      ) : (
        <>
          <div className="flex justify-center p-4 font-bold text-2xl border-b-2 border-solid border-primary">
            Chats
          </div>
          <div className="flex flex-col font-semibold tracking-wider overflow-auto gap-[2px]">
            {chatNamesList1.map(({ headingName, name }) => (
              <NavLink
                key={name}
                to={`/${name}`}
                className={({ isActive }) =>
                  `cursor-pointer w-[100%] py-3 px-6  text-left transition text-xl hover:bg-primary ${
                    isActive && "bg-primary"
                  }`
                }
              >
                {headingName}
              </NavLink>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ChatBar;
