export function LogoutButton() {
  return (
    <form action="/api/new-launch/logout" method="POST">
      <button
        type="submit"
        className="min-h-[44px] rounded-md px-3 text-sm font-medium underline-offset-4 hover:underline"
        style={{ color: "#4e4439" }}
      >
        Log out
      </button>
    </form>
  );
}
