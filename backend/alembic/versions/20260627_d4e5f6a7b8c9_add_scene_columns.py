"""add_system_design_scene_columns

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-06-27 00:30:00.000000+00:00

Adds re-editable tldraw document snapshots for the in-app design canvas
(HLD and LLD). The existing hld_image / lld_image columns now hold the PNG
rasterized from each canvas (consumed by the multimodal evaluation).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, None] = 'c3d4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('system_design_submissions', sa.Column('hld_scene', sa.JSON(), nullable=True))
    op.add_column('system_design_submissions', sa.Column('lld_scene', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('system_design_submissions', 'lld_scene')
    op.drop_column('system_design_submissions', 'hld_scene')
