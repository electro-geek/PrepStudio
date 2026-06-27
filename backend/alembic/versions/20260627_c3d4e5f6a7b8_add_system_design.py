"""add_system_design_tables

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-06-27 00:00:00.000000+00:00

Adds the dedicated System Design practice track: tracks, challenges, and a
single submission per challenge (functional/non-functional requirements, an
uploaded HLD diagram image, low-level design, and the structured evaluation).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'system_design_tracks',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('total_days', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['app_users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'system_design_challenges',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('track_id', sa.String(), nullable=False),
        sa.Column('product', sa.String(), nullable=False),
        sa.Column('prompt', sa.Text(), nullable=True),
        sa.Column('difficulty', sa.String(), nullable=True),
        sa.Column('difficulty_rank', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('day_number', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('is_complete', sa.Boolean(), nullable=True),
        sa.Column('model_answer_markdown', sa.Text(), nullable=True),
        sa.Column('model_diagram_mermaid', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['track_id'], ['system_design_tracks.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_system_design_challenges_track_id', 'system_design_challenges', ['track_id'], unique=False)

    op.create_table(
        'system_design_submissions',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('challenge_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('functional_reqs', sa.Text(), nullable=True),
        sa.Column('nonfunctional_reqs', sa.Text(), nullable=True),
        sa.Column('hld_image', sa.Text(), nullable=True),
        sa.Column('hld_notes', sa.Text(), nullable=True),
        sa.Column('lld_text', sa.Text(), nullable=True),
        sa.Column('lld_image', sa.Text(), nullable=True),
        sa.Column('evaluation', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['challenge_id'], ['system_design_challenges.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['app_users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('challenge_id'),
    )
    op.create_index('ix_system_design_submissions_challenge_id', 'system_design_submissions', ['challenge_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_system_design_submissions_challenge_id', table_name='system_design_submissions')
    op.drop_table('system_design_submissions')
    op.drop_index('ix_system_design_challenges_track_id', table_name='system_design_challenges')
    op.drop_table('system_design_challenges')
    op.drop_table('system_design_tracks')
