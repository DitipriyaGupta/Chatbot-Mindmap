import Echo from "laravel-echo";
import Pusher from "pusher-js";
import baseDomain from "components/common/baseDomain.js";

export function setupPusher() {
    window.Pusher = Pusher;

    window.Echo = new Echo({
        broadcaster: "pusher",
        key: process.env.REACT_APP_PUSHER_APP_KEY,
        cluster: "ap2",
        forceTLS: true,
        encrypted: true,
        auth: {
            headers: {
                Authorization: `Bearer 1038566a0f36d4d1e9af:4fff1954c893d7b14c9fea8cdb65f296ba4f800062f11e4b5db89a050c870dc8`,
                Accept: "application/json",
            },
        },
       // authEndpoint: `${baseDomain.route}/broadcasting/auth`,
        auth: {
            params: {
                channel_data: JSON.stringify({
                    user_id: "3929",
                    user_info: {
                        id: 3929,
                        name: "Beyond Chat",
                        email: "beyondchat@gmail.com",
                        phone: "3243254534",
                        email_verified_at: null,
                        password_updated: 0,
                        created_at: "2024-08-15T05:34:23.000000Z",
                        updated_at: "2024-08-22T08:17:41.000000Z",
                        device: "desktop",
                        browser: "Chrome",
                        os: "Windows",
                        city: "Lucknow",
                        country: {
                            id: 103,
                            name: "India",
                            code: "IN",
                            phone_code: "91"
                        }
                    }
                }),
            },
        },
    });
}
