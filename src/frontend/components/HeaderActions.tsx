import { deleteCookie } from "../utils/cookie";

interface HeaderActionsProps {

}

export default function HeaderActions() {
    const actions = [
        {
            id: 'exit',
            label: 'exit',
            icon: (
                <svg viewBox="0 0 512 512">
                    <line strokeWidth="13.4167" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="2.6131" x1="486.21" x2="26.739" y1="26.814" y2="486.139"></line>
                    <line strokeWidth="13.4167" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="2.6131" x1="486.21" x2="26.739" y1="486.139" y2="26.814"></line>
                </svg>
            ),
        }
    ];

    async function handleLogout(): Promise<void> {
        await deleteCookie('session-id');
        sessionStorage.removeItem('guest');
        location.reload();
    }

    return (
        <div id="header-actions">
            {actions.map((action) => (
                <button
                    key={action.id}
                    className={`action-btn`}
                    onClick={() => handleLogout()}
                >
                    {action.icon}
                    {/* <span>{action.label}</span> */}
                </button>
            ))}
        </div>
    );
}
