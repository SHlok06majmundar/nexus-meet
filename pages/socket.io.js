// This is a special Next.js page route for handling socket.io connections
// Having this file helps ensure the socket.io path is correctly handled

import { Server } from 'socket.io';

export default function SocketIoHandler() {
    // This component never renders - it just enables the API route
    return null;
}

// This will run server-side only
export async function getServerSideProps() {
    // Just pass empty props
    return {
        props: {},
    };
}

// Socket.io handler
export const config = {
    api: {
        bodyParser: false,
    },
};
