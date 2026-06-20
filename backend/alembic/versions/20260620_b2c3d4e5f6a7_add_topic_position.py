"""add_topic_position

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-06-20 00:30:00.000000+00:00

Adds an explicit `position` column to topics so chapter ordering within a day
is stable. Previously topics were ordered by created_at, but every topic in a
plan is inserted in one transaction and Postgres now() returns the transaction
start time, so all topics shared an identical timestamp and the order was
non-deterministic across queries. Existing rows are backfilled with a stable
order derived from (created_at, id) per day.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add as NOT NULL with a server default so existing rows get a value.
    op.add_column(
        'topics',
        sa.Column('position', sa.Integer(), nullable=False, server_default='0'),
    )

    # Backfill a stable, deterministic order for pre-existing topics.
    op.execute(
        """
        UPDATE topics AS t
        SET position = sub.rn - 1
        FROM (
            SELECT id,
                   ROW_NUMBER() OVER (
                       PARTITION BY day_id
                       ORDER BY created_at, id
                   ) AS rn
            FROM topics
        ) AS sub
        WHERE t.id = sub.id
        """
    )

    # Drop the server default now that data is backfilled — the application
    # always supplies position explicitly (model default 0 covers any gap).
    op.alter_column('topics', 'position', server_default=None)


def downgrade() -> None:
    op.drop_column('topics', 'position')
