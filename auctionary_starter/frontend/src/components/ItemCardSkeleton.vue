<template>
    <div class="item-card-skeleton">
        <div class="skeleton-badge"></div>
        <div class="skeleton-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text short"></div>
            <div class="skeleton-footer">
                <div class="skeleton-price"></div>
                <div class="skeleton-badge-small"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.item-card-skeleton {
    background: var(--color-white);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    position: relative;
    overflow: hidden;
}

.item-card-skeleton::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.5),
        transparent
    );
    animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
    to {
        left: 100%;
    }
}

.skeleton-badge {
    width: 64px;
    height: 64px;
    background: var(--color-slate-100);
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-md);
}

.skeleton-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.skeleton-title {
    width: 80%;
    height: 24px;
    background: var(--color-slate-100);
    border-radius: var(--radius-sm);
}

.skeleton-text {
    width: 100%;
    height: 16px;
    background: var(--color-slate-100);
    border-radius: var(--radius-sm);
}

.skeleton-text.short {
    width: 60%;
}

.skeleton-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--space-sm);
}

.skeleton-price {
    width: 100px;
    height: 20px;
    background: var(--color-slate-100);
    border-radius: var(--radius-sm);
}

.skeleton-badge-small {
    width: 60px;
    height: 24px;
    background: var(--color-slate-100);
    border-radius: var(--radius-full);
}
</style>
