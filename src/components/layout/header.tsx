import Link from "next/link";
import { cn } from "~/lib/utils";
import { fontInter } from "~/constants/font";
import { UserNav } from "./usernav";

export default function Header() {
  return (
    <div
      className={cn(
        "supports-backdrop-blur:bg-background/60 fixed left-0 right-0 top-0 z-20 border-b bg-background/95 font-sans antialiased backdrop-blur",
        fontInter.variable
      )}
    >
      <nav className="flex h-14 items-center justify-between px-4">
        <div className="flex flex-row gap-3">
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="36" height="36" rx="8" fill="#4261FF" />
            <g clip-path="url(#clip0_3407_42499)">
              <path
                opacity="0.987"
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M14.3041 7.00781C15.2985 7.00781 16.2929 7.00781 17.2873 7.00781C17.2592 7.30415 17.167 7.57905 17.0111 7.83228C14.3544 12.67 11.721 17.5383 9.11104 22.4371C8.9864 22.5269 8.85746 22.6054 8.72432 22.6727C7.6751 21.2796 7.1042 19.6895 7.01172 17.9026C7.06188 17.2482 7.15392 16.6004 7.28794 15.9592C8.43693 13.706 9.61554 11.4682 10.8236 9.24565C11.7549 8.07255 12.915 7.32665 14.3041 7.00781Z"
                fill="white"
              />
              <path
                opacity="0.987"
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M18.1717 18.1965C18.0612 18.3535 17.9507 18.3535 17.8402 18.1965C17.8738 18.12 17.9106 18.0414 17.9507 17.961C17.4341 17.0956 16.9737 16.1926 16.5696 15.252C15.6693 11.7351 16.7189 9.12432 19.7185 7.41956C20.0803 7.27799 20.4485 7.16021 20.8234 7.06622C21.8172 7.00733 22.8116 6.98778 23.8067 7.00733C23.824 7.16904 23.8056 7.32616 23.7514 7.47845C22.0867 10.5955 20.3924 13.6971 18.6689 16.7831C18.4098 17.2175 18.244 17.6886 18.1717 18.1965Z"
                fill="white"
              />
              <path
                opacity="0.99"
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M27.0108 13.2524C27.1741 13.2215 27.3214 13.2607 27.4527 13.3702C29.2164 15.857 29.4558 18.4874 28.1709 21.2615C27.1724 22.9626 26.2148 24.69 25.2982 26.4438C23.5442 28.6973 21.3897 29.404 18.8345 28.5639C21.5607 23.458 24.2862 18.3542 27.0108 13.2524Z"
                fill="white"
              />
              <path
                opacity="0.991"
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M17.8402 18.1953C17.9507 18.3523 18.0612 18.3523 18.1716 18.1953C20.092 20.6816 20.3313 23.3513 18.8898 26.2044C17.2118 28.4765 15.0203 29.3599 12.3157 28.8545C12.2033 28.7309 12.1848 28.5935 12.2604 28.4423C14.1217 25.023 15.9817 21.6073 17.8402 18.1953Z"
                fill="white"
              />
            </g>
            <defs>
              <clipPath id="clip0_3407_42499">
                <rect
                  width="22"
                  height="22"
                  fill="white"
                  transform="translate(7 7)"
                />
              </clipPath>
            </defs>
          </svg>

          <h2 className="text-3xl font-semibold tracking-tight">Soff</h2>
        </div>
        <div className={cn("block lg:!hidden")}>{/* <MobileSidebar /> */}</div>

        <div className="flex items-center gap-2">
          <UserNav />
          {/* <ThemeToggle /> */}
        </div>
      </nav>
    </div>
  );
}
