import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import TextArea from './TextArea';

describe('TextArea', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders label and textarea with correct name and id', () => {
        render(<TextArea label="Description" name="description" />);

        expect(screen.getByText('Description')).toBeInTheDocument();

        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveAttribute('name', 'description');
        expect(textarea).toHaveAttribute('id', 'description');
    });

    it('renders with defaultValue', () => {
        render(<TextArea label="Notes" name="notes" defaultValue="Some notes here" />);

        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveValue('Some notes here');
    });

    it('passes additional props to textarea', () => {
        render(<TextArea label="Comments" name="comments" required placeholder="Enter comments" maxLength={500} />);

        const textarea = screen.getByRole('textbox');
        expect(textarea).toBeRequired();
        expect(textarea).toHaveAttribute('placeholder', 'Enter comments');
        expect(textarea).toHaveAttribute('maxLength', '500');
    });

    it('has appropriate styling classes', () => {
        render(<TextArea label="Bio" name="bio" />);

        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveClass('textarea', 'textarea-ghost');
    });
});
