# MemeX CSS Customization Guide

## Overview
This guide explains how to customize the appearance of your MemeX application using the comprehensive CSS system we've created.

## File Structure
- `src/styles/app.css` - Main CSS file with all styles and variables
- `src/App.jsx` - Imports the CSS file
- `src/context/ThemeContext.jsx` - Handles theme switching

## CSS Variables (Easy Customization)

### Primary Colors
The main brand colors used throughout the app:
```css
:root {
  --primary-50: #fff7ed;   /* Lightest orange */
  --primary-500: #f97316;  /* Main orange */
  --primary-900: #7c2d12;  /* Darkest orange */
}
```

### Secondary Colors
Supporting colors for backgrounds and text:
```css
:root {
  --secondary-50: #f8fafc;   /* Lightest gray */
  --secondary-500: #64748b;   /* Medium gray */
  --secondary-900: #0f172a;   /* Darkest gray */
}
```

### Accent Colors
Highlight colors for special elements:
```css
:root {
  --accent-500: #eab308;  /* Yellow */
  --accent-600: #ca8a04;  /* Darker yellow */
}
```

### Spacing
Consistent spacing throughout the app:
```css
:root {
  --space-xs: 0.25rem;    /* 4px */
  --space-sm: 0.5rem;     /* 8px */
  --space-md: 1rem;       /* 16px */
  --space-lg: 1.5rem;     /* 24px */
  --space-xl: 2rem;       /* 32px */
}
```

### Border Radius
Rounded corners for different elements:
```css
:root {
  --radius-sm: 0.375rem;  /* 6px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-full: 9999px;  /* Full circle */
}
```

### Shadows
Different shadow depths:
```css
:root {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-glow: 0 0 20px rgba(249, 115, 22, 0.3);
}
```

## How to Customize

### 1. Change Brand Colors
To change the main orange color to blue, update these variables:
```css
:root {
  --primary-50: #eff6ff;   /* Light blue */
  --primary-100: #dbeafe;  /* Lighter blue */
  --primary-500: #3b82f6;  /* Main blue */
  --primary-600: #2563eb;  /* Darker blue */
  --primary-900: #1e3a8a;  /* Darkest blue */
}
```

### 2. Change Font Family
To use a different font:
```css
:root {
  --font-family: 'Roboto', 'Arial', sans-serif;
}
```

### 3. Adjust Spacing
To make the app more compact or spacious:
```css
:root {
  --space-md: 0.75rem;    /* Smaller spacing */
  --space-lg: 2rem;       /* Larger spacing */
}
```

### 4. Modify Border Radius
To make corners more or less rounded:
```css
:root {
  --radius-lg: 0.5rem;    /* Less rounded */
  --radius-xl: 1.5rem;    /* More rounded */
}
```

### 5. Customize Shadows
To change shadow intensity:
```css
:root {
  --shadow-md: 0 8px 25px -5px rgba(0, 0, 0, 0.2);  /* Stronger shadow */
  --shadow-lg: 0 20px 40px -10px rgba(0, 0, 0, 0.3); /* Even stronger */
}
```

## Component Classes

### Buttons
```css
.btn              /* Base button styles */
.btn-primary      /* Primary action button */
.btn-secondary    /* Secondary action button */
.btn-outline      /* Outlined button */
.btn-ghost        /* Transparent button */
.btn-sm           /* Small button */
.btn-lg           /* Large button */
```

### Cards
```css
.card             /* Base card container */
.card-header      /* Card header section */
.card-body        /* Card content section */
.card-footer      /* Card footer section */
```

### Forms
```css
.form-group       /* Form field container */
.form-label       /* Form field label */
.form-input       /* Form input field */
```

### Navigation
```css
.navbar           /* Main navigation bar */
.navbar-brand     /* Logo and brand name */
.navbar-search    /* Search bar container */
.navbar-logo      /* Logo icon */
```

### Posts
```css
.post-card        /* Post container */
.post-vote-section /* Voting buttons section */
.post-content     /* Post text content */
.post-meta        /* Post metadata */
.post-title       /* Post title */
.post-text        /* Post body text */
.post-media       /* Post images/videos */
.post-tags        /* Post tags */
.post-actions     /* Post action buttons */
```

### Sidebar
```css
.sidebar          /* Sidebar container */
.sidebar-section  /* Sidebar section */
.sidebar-title    /* Section title */
.community-item   /* Community list item */
.community-avatar /* Community avatar */
.community-info   /* Community information */
```

## Dark Mode Support

The CSS automatically supports dark mode through the `[data-theme="dark"]` selector. When the theme is toggled, these styles automatically apply:

```css
[data-theme="dark"] {
  --white: #111827;        /* Dark background */
  --black: #ffffff;        /* Light text */
  --gray-50: #1f2937;     /* Dark gray backgrounds */
  /* ... more dark mode variables */
}
```

## Responsive Design

The CSS includes responsive breakpoints:
- Mobile: `@media (max-width: 768px)`
- Small mobile: `@media (max-width: 640px)`

## Animations

Pre-built animations you can use:
```css
.animate-fade-in      /* Fade in effect */
.animate-slide-up     /* Slide up from bottom */
.animate-slide-down   /* Slide down from top */
.animate-scale-in     /* Scale in effect */
.animate-bounce-gentle /* Gentle bounce */
.animate-pulse-gentle /* Gentle pulse */
```

## Best Practices

1. **Use CSS Variables**: Always use the predefined variables instead of hardcoded values
2. **Maintain Consistency**: Keep spacing, colors, and typography consistent across components
3. **Test Both Themes**: Always test your changes in both light and dark modes
4. **Mobile First**: Consider mobile devices when making layout changes
5. **Performance**: The CSS is optimized for performance with minimal repaints

## Example Customization

Here's a complete example of changing the app to use a purple theme:

```css
:root {
  /* Change primary colors to purple */
  --primary-50: #faf5ff;
  --primary-100: #f3e8ff;
  --primary-500: #a855f7;
  --primary-600: #9333ea;
  --primary-900: #581c87;
  
  /* Adjust spacing for a more compact feel */
  --space-md: 0.75rem;
  --space-lg: 1.25rem;
  
  /* Use a different font */
  --font-family: 'Poppins', 'Inter', sans-serif;
  
  /* Make corners more rounded */
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
}
```

## Need Help?

If you need assistance with customization:
1. Check the CSS variables in `src/styles/app.css`
2. Use browser dev tools to inspect elements
3. Test changes incrementally
4. Ensure both light and dark themes work correctly

Happy customizing! 🎨
