function FindCleanerButton({ isSearching, onFindCleaner, t = (key) => key }) {
  return (
    <button
      className={`primary-action ${isSearching ? 'primary-action--searching' : ''}`}
      disabled={isSearching}
      onClick={onFindCleaner}
      type="button"
    >
      {isSearching ? t('searching') : t('findCleaner')}
    </button>
  )
}

export default FindCleanerButton
