import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Recipes from './Recipes';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const allRecipes = [
  { id: 1, title: 'Burger' },
  { id: 2, title: 'French toast' },
  { id: 3, title: 'Salmon' }
];

const server = setupServer(
  rest.get('/api/recipes', (req, res, ctx) => {
    if (req.url.searchParams.get('ingredient') === 'fish') {
      return res(ctx.json({ recipes: allRecipes.filter(recipe => recipe.id === 3) }));
    }
    return res(ctx.json({ recipes: allRecipes }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('renders the heading, input field and button', () => {
  render(<Recipes />);

  expect(screen.getByRole('heading')).toHaveTextContent('Recipe Finder');
  expect(screen.getByPlaceholderText('Enter an ingredient to find recipes...'))
    .toBeInTheDocument();
  expect(screen.getByRole('button')).toHaveTextContent('Find');
});

test('fetches and displays all recipes', async () => {
  render(<Recipes />);

  const listItems = await screen.findAllByRole('listitem');
  expect(listItems).toHaveLength(3);
  expect(listItems[0]).toHaveTextContent('Burger');
  expect(listItems[1]).toHaveTextContent('French toast');
  expect(listItems[2]).toHaveTextContent('Salmon');
});

test('displays filtered recipes when searching for an ingredient', async () => {
  render(<Recipes />);

  const input = screen.getByPlaceholderText('Enter an ingredient to find recipes...');

  fireEvent.change(input, { target: { value: 'fish' } });
  fireEvent.click(screen.getByRole('button', { name: 'Find' }));

  expect(await screen.findByText('Showing results for fish:')).toBeInTheDocument();

  const listItems = screen.getAllByRole('listitem');
  expect(listItems).toHaveLength(1);
  expect(listItems[0]).toHaveTextContent('Salmon');
});

test('displays error message when fetching recipes is unsuccessful', async () => {
  server.use(
    rest.get('/api/recipes', (req, res, ctx) => {
      return res(
        ctx.status(500),
        ctx.json({ message: 'Internal server error' }),
      );
    })
  );
  render(<Recipes />);

  expect(screen.queryByRole('listitem')).not.toBeInTheDocument();

  expect(await screen.findByText(
    'Failed to fetch recipes, error message: Internal Server Error'
  )).toBeInTheDocument();
});
