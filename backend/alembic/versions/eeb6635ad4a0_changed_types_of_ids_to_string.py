"""Changed types of IDs to string

Revision ID: eeb6635ad4a0
Revises: 4ac9833d3434
Create Date: 2025-10-14 16:13:57.745173

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eeb6635ad4a0'
down_revision: Union[str, Sequence[str], None] = '4ac9833d3434'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


from alembic import op

def upgrade():
    # 1. Drop FKs on item_category
    op.drop_constraint('item_category_item_id_fkey', 'item_category', type_='foreignkey')
    op.drop_constraint('item_category_category_id_fkey', 'item_category', type_='foreignkey')

    # 2. Alter id columns on items and categories
    op.execute('ALTER TABLE items ALTER COLUMN id TYPE TEXT USING id::text;')
    op.execute('ALTER TABLE categories ALTER COLUMN id TYPE TEXT USING id::text;')

    # 3. Alter FK columns on item_category
    op.execute('ALTER TABLE item_category ALTER COLUMN item_id TYPE TEXT USING item_id::text;')
    op.execute('ALTER TABLE item_category ALTER COLUMN category_id TYPE TEXT USING category_id::text;')

    # 4. Recreate FKs
    op.create_foreign_key(
        'item_category_item_id_fkey',
        'item_category', 'items',
        ['item_id'], ['id'],
        ondelete='CASCADE'
    )
    op.create_foreign_key(
        'item_category_category_id_fkey',
        'item_category', 'categories',
        ['category_id'], ['id'],
        ondelete='CASCADE'
    )


def downgrade():
    # Reverse the process
    op.drop_constraint('item_category_item_id_fkey', 'item_category', type_='foreignkey')
    op.drop_constraint('item_category_category_id_fkey', 'item_category', type_='foreignkey')

    op.execute('ALTER TABLE items ALTER COLUMN id TYPE INTEGER USING id::integer;')
    op.execute('ALTER TABLE categories ALTER COLUMN id TYPE INTEGER USING id::integer;')

    op.execute('ALTER TABLE item_category ALTER COLUMN item_id TYPE INTEGER USING item_id::integer;')
    op.execute('ALTER TABLE item_category ALTER COLUMN category_id TYPE INTEGER USING category_id::integer;')

    op.create_foreign_key(
        'item_category_item_id_fkey',
        'item_category', 'items',
        ['item_id'], ['id'],
        ondelete='CASCADE'
    )
    op.create_foreign_key(
        'item_category_category_id_fkey',
        'item_category', 'categories',
        ['category_id'], ['id'],
        ondelete='CASCADE'
    )
