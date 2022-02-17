import * as React from 'react';
import clsx from 'clsx';
import {useRouter} from 'next/router';
import NextLink, {LinkProps as NextLinkProps} from 'next/link';
import MuiLink, {LinkProps as MuiLinkProps} from '@mui/material/Link';
import {styled} from '@mui/material/styles';

// Add support for the sx prop for consistency with the other branches.
const Anchor = styled('a')({});

interface NextLinkComposedProps
	extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>,
		Omit<NextLinkProps, 'href' | 'as'> {
	to: NextLinkProps['href'];
	linkAs?: NextLinkProps['as'];
	href?: NextLinkProps['href'];
}

export const NextLinkComposed = React.forwardRef<
	HTMLAnchorElement,
	NextLinkComposedProps
>(
	(
		{to, linkAs, href, replace, scroll, shallow, prefetch, locale, ...other},
		ref,
	) => {
		return (
			<NextLink
				passHref
				href={to}
				prefetch={prefetch}
				as={linkAs}
				replace={replace}
				scroll={scroll}
				shallow={shallow}
				locale={locale}
			>
				<Anchor ref={ref} {...other} />
			</NextLink>
		);
	},
);

export type LinkProps = {
	activeClassName?: string;
	as?: NextLinkProps['as'];
	href: NextLinkProps['href'];
	linkAs?: NextLinkProps['as']; // Useful when the as prop is shallow by styled().
	noLinkStyle?: boolean;
} & Omit<NextLinkComposedProps, 'to' | 'linkAs' | 'href'> &
	Omit<MuiLinkProps, 'href'>;

// A styled version of the Next.js Link component:
// https://nextjs.org/docs/api-reference/next/link
const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
	(
		{
			activeClassName = 'active',
			as: linkAs,
			className: classNameProps,
			href,
			noLinkStyle,
			role, // Link don't have roles.
			...other
		},
		ref,
	) => {
		const router = useRouter();
		const pathname = typeof href === 'string' ? href : href.pathname;
		const className = clsx(classNameProps, {
			[activeClassName]: router.pathname === pathname && activeClassName,
		});

		const isExternal =
			typeof href === 'string' &&
			(href.startsWith('http') || href.startsWith('mailto:'));

		if (isExternal) {
			if (noLinkStyle) {
				return (
					<Anchor ref={ref} className={className} href={href} {...other} />
				);
			}

			return <MuiLink ref={ref} className={className} href={href} {...other} />;
		}

		if (noLinkStyle) {
			return (
				<NextLinkComposed
					ref={ref}
					className={className}
					to={href}
					{...other}
				/>
			);
		}

		return (
			<MuiLink
				ref={ref}
				component={NextLinkComposed}
				linkAs={linkAs}
				className={className}
				to={href}
				{...other}
			/>
		);
	},
);

export default Link;
