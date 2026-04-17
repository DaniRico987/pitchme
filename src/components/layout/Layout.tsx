import type { ReactNode } from "react";
import Header from "./Header";

type LayoutProps = {
	children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
	return (
		<div className="min-h-screen bg-white">
			<Header />
			<main className="mx-auto max-w-5xl px-4 pb-16 pt-20">{children}</main>
		</div>
	);
}

export default Layout;
