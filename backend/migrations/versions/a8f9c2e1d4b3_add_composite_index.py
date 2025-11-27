"""add composite index for url and datetime

Revision ID: a8f9c2e1d4b3
Revises: 6d3a544c8786
Create Date: 2025-11-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a8f9c2e1d4b3'
down_revision: Union[str, None] = '6d3a544c8786'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - add composite index for url and datetime_visited."""
    # Create composite index for better query performance on URL + datetime filtering
    op.create_index(
        'ix_page_metrics_url_datetime',
        'page_metrics',
        ['url', 'datetime_visited'],
        unique=False
    )


def downgrade() -> None:
    """Downgrade schema - remove composite index."""
    op.drop_index('ix_page_metrics_url_datetime', table_name='page_metrics')
